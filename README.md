# Sensor Bar Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/release/tommysharpnz/sensor-bar-card.svg)](https://github.com/tommysharpnz/sensor-bar-card/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A polished, highly configurable bar card for [Home Assistant](https://www.home-assistant.io/) Lovelace dashboards. Display any sensor as an animated, colour-coded horizontal bar — power usage, temperature, humidity, water flow, battery level, CO₂, and more.

Clicking any bar opens the native Home Assistant entity dialog with full history, attributes, and charts.

My first ever Home Assistant card so please let me know what features it's missing or if any bugs!

![Sensor Bar Card preview](images/preview.png)

---

## Features

- 🎨 **Three colour modes** — smooth gradient, severity bands, or a single colour
- 📍 **Configurable label position** — left, above, inside the bar, or off
- 📈 **Optional peak marker** — shows the highest value seen this session as a labelled marker on the bar
- ✨ **Animated fill** — smooth transition when values change
- 🖱️ **Native HA entity dialog** — click any bar to open the Home Assistant more-info popup
- 🔧 **Per-entity overrides** — every setting can be set globally and overridden per entity
- 🌡️ **Works with any sensor** — power, temperature, humidity, battery, CO₂, water flow, etc.

---

## Installation

### HACS (Recommended)

1. Open **HACS** in Home Assistant
2. Click the three dots (⋮) in the top right → **Custom repositories**
3. Add `https://github.com/tommysharpnz/sensor-bar-card` and select **Dashboard** as the category
4. Click **Add**
5. Search for **Sensor Bar Card** and click **Download**
6. Restart Home Assistant or hard refresh your browser

### Manual

1. Download `sensor-bar-card.js` from the [latest release](https://github.com/tommysharpnz/sensor-bar-card/releases/latest)
2. Copy it to your Home Assistant `/config/www/` folder
3. Go to **Settings → Dashboards → Resources** and add:
   - URL: `/local/sensor-bar-card.js`
   - Type: `JavaScript Module`
4. Hard refresh your browser (Ctrl+Shift+R)

---

## Usage

Add the card via the Lovelace UI by choosing **Manual card** and pasting a config, or edit your dashboard YAML directly.

```yaml
type: custom:sensor-bar-card
title: Power Usage
entities:
  - entity: sensor.kettle_power
    name: Kettle
    icon: mdi:kettle
    max: 3000
```

---

## Configuration

### Card options

All options below can be set at the card level as **global defaults**, and overridden per entity.

| Option | Type | Default | Description |
|---|---|---|---|
| `title` | string | — | Optional card title shown above the bars |
| `entities` | list | **required** | List of entities to display (see entity options below) |
| `label_position` | string | `left` | Where to show the entity name — `left`, `above`, `inside`, `off` |
| `color_mode` | string | `severity` | How to colour the bar — `gradient`, `severity`, `single` |
| `color` | string | `#4a9eff` | Bar colour when `color_mode` is `single` |
| `severity` | list | green/orange/red | Colour bands — see [Severity](#severity) |
| `animated` | boolean | `true` | Animate bar width transitions |
| `show_peak` | boolean | `false` | Show a peak value marker on the bar |
| `min` | number | `0` | Minimum value (maps to 0% bar width) |
| `max` | number | `100` | Maximum value (maps to 100% bar width) |
| `height` | number | `38` | Bar height in pixels |
| `unit` | string | — | Override the unit of measurement |

### Entity options

Each entity in the `entities` list accepts all card-level options above as overrides, plus:

| Option | Type | Description |
|---|---|---|
| `entity` | string | **Required.** The Home Assistant entity ID |
| `name` | string | Display name (defaults to the entity's friendly name) |
| `icon` | string | Any MDI icon e.g. `mdi:thermometer` |

### Severity

Used when `color_mode: severity`. Define colour bands with `from` and `to` percentage values:

```yaml
severity:
  - from: 0
    to: 33
    color: '#4CAF50'   # green
  - from: 33
    to: 75
    color: '#FF9800'   # orange
  - from: 75
    to: 100
    color: '#F44336'   # red
```

### Color modes

| Mode | Description |
|---|---|
| `gradient` | Smoothly blends from green → orange → red as the value rises |
| `severity` | Hard colour bands defined by your `severity` config |
| `single` | One fixed colour defined by the `color` option |

### Label positions

| Position | Description |
|---|---|
| `left` | Name on the left, value on the right — all bars start at the same position |
| `above` | Name and value shown above the bar |
| `inside` | Name and value shown inside the bar (use with taller `height`) |
| `off` | No label — value still shown on the right |

---

## Examples

### Power monitoring

![Power monitoring example](images/example-power.png)

```yaml
type: custom:sensor-bar-card
title: Power Usage
color_mode: gradient
label_position: left
animated: true
show_peak: true
entities:
  - entity: sensor.kettle_power
    name: Kettle
    icon: mdi:kettle
    max: 3000
  - entity: sensor.washing_machine_power
    name: Washing Machine
    icon: mdi:washing-machine
    max: 2000
  - entity: sensor.fridge_power
    name: Fridge
    icon: mdi:fridge
    max: 200
```

---

### Temperature

![Temperature example](images/example-temperature.png)

```yaml
type: custom:sensor-bar-card
title: Temperatures
color_mode: severity
label_position: left
min: 0
max: 40
severity:
  - from: 0
    to: 18
    color: '#4a9eff'   # cool - blue
  - from: 18
    to: 24
    color: '#4CAF50'   # comfortable - green
  - from: 24
    to: 40
    color: '#F44336'   # hot - red
entities:
  - entity: sensor.living_room_temperature
    name: Living Room
    icon: mdi:sofa
  - entity: sensor.bedroom_temperature
    name: Bedroom
    icon: mdi:bed
  - entity: sensor.outside_temperature
    name: Outside
    icon: mdi:weather-sunny
```

---

### Humidity

![Humidity example](images/example-humidity.png)

```yaml
type: custom:sensor-bar-card
title: Humidity
color_mode: severity
min: 0
max: 100
severity:
  - from: 0
    to: 30
    color: '#FF9800'   # too dry
  - from: 30
    to: 60
    color: '#4CAF50'   # ideal
  - from: 60
    to: 100
    color: '#4a9eff'   # too humid
entities:
  - entity: sensor.living_room_humidity
    name: Living Room
    icon: mdi:sofa
  - entity: sensor.bathroom_humidity
    name: Bathroom
    icon: mdi:shower
```

---

### Battery levels

```yaml
type: custom:sensor-bar-card
title: Battery Levels
color_mode: severity
min: 0
max: 100
severity:
  - from: 0
    to: 20
    color: '#F44336'   # critical
  - from: 20
    to: 50
    color: '#FF9800'   # low
  - from: 50
    to: 100
    color: '#4CAF50'   # good
entities:
  - entity: sensor.phone_battery
    name: Phone
    icon: mdi:cellphone
  - entity: sensor.tablet_battery
    name: Tablet
    icon: mdi:tablet
  - entity: sensor.remote_battery
    name: Remote
    icon: mdi:remote
```

---

### Mixed sensors with per-entity overrides

```yaml
type: custom:sensor-bar-card
title: Home Overview
color_mode: gradient
label_position: left
animated: true
show_peak: false
entities:
  - entity: sensor.total_power
    name: Power
    icon: mdi:lightning-bolt
    max: 5000
    show_peak: true          # override: show peak for this one only
  - entity: sensor.living_room_temperature
    name: Temperature
    icon: mdi:thermometer
    min: 0
    max: 40
    color_mode: severity     # override: use severity for temperature
    severity:
      - from: 0
        to: 18
        color: '#4a9eff'
      - from: 18
        to: 24
        color: '#4CAF50'
      - from: 24
        to: 40
        color: '#F44336'
  - entity: sensor.solar_battery
    name: Battery
    icon: mdi:battery
    max: 100
    color_mode: single       # override: single colour for battery
    color: '#4CAF50'
    label_position: above    # override: label above for this row
    height: 28               # override: shorter bar
```

---

## Peak Marker

When `show_peak: true`, the card tracks the highest value seen since the page was loaded and displays it as a dark vertical marker on the bar with a small floating label above showing the peak value.

This is useful for spotting brief spikes you might otherwise miss — for example a kettle turning on for 30 seconds.

> **Note:** The peak resets when the page is reloaded as it is stored in memory only.

---

## Contributing

Pull requests and issues are welcome! Please open an issue first for major changes.

1. Fork the repository
2. Make your changes to `dist/sensor-bar-card.js`
3. Test in Home Assistant
4. Open a pull request

---

## License

[MIT](LICENSE)
