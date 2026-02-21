# Sensor Bar Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/release/TommySharpNZ/sensor-bar-card.svg)](https://github.com/TommySharpNZ/Sensor-Bar-Card/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A polished, highly configurable bar card for [Home Assistant](https://www.home-assistant.io/) Lovelace dashboards. Display any sensor as an animated, colour-coded horizontal bar.

Works great for power, temperature, humidity, battery, CO₂, water flow, and any other numeric sensor.

Clicking any bar opens the native Home Assistant entity dialog with full history, attributes, and charts.

![Preview](images/preview.png)

> *My first ever Home Assistant card — please open an issue if you find bugs or have feature requests!*

---

## Features

- 🎨 **Three colour modes** — smooth gradient, severity bands, or a single fixed colour
- 📍 **Four label positions** — left, above, inside the bar, or off
- 📈 **Optional peak marker** — a subtle chevron and line marking the highest value seen this session
- ✨ **Animated fill** — smooth bar width and colour transitions on value change
- 🖱️ **Native HA entity dialog** — click any bar to open the Home Assistant more-info popup with history
- 🔧 **Per-entity overrides** — every option can be set as a global default and overridden per entity
- 📐 **Configurable bar height** — set different heights per entity or globally
- 🌡️ **Works with any sensor** — power, temperature, humidity, battery, CO₂, water flow, and more

---

## Installation

### HACS (Recommended)

1. Open **HACS** in Home Assistant
2. Click the three dots (⋮) in the top right → **Custom repositories**
3. Add `https://github.com/TommySharpNZ/Sensor-Bar-Card` and select **Dashboard** as the category
4. Click **Add**
5. Search for **Sensor Bar Card** and click **Download**
6. Hard refresh your browser (Ctrl+Shift+R)

### Manual

1. Download `sensor-bar-card.js` from the [latest release](https://github.com/TommySharpNZ/Sensor-Bar-Card/releases/latest)
2. Copy it to your Home Assistant `/config/www/` folder
3. Go to **Settings → Dashboards → Resources** and add:
   - URL: `/local/sensor-bar-card.js`
   - Type: `JavaScript Module`
4. Hard refresh your browser (Ctrl+Shift+R)

---

## Quick Start

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

All options can be set at the **card level as global defaults** and overridden individually per entity.

### Card Options

| Option | Type | Default | Description |
|---|---|---|---|
| `title` | string | — | Optional title shown above the bars |
| `entities` | list | **required** | List of entities to display |
| `label_position` | string | `left` | Label position — `left` \| `above` \| `inside` \| `off` |
| `color_mode` | string | `severity` | Bar colour mode — `gradient` \| `severity` \| `single` |
| `color` | string | `#4a9eff` | Bar colour when `color_mode: single` |
| `severity` | list | green/orange/red | Colour bands — see [Severity](#severity-options) |
| `animated` | boolean | `true` | Smooth bar width and colour transitions |
| `show_peak` | boolean | `false` | Show peak marker for the highest value seen this session |
| `min` | number | `0` | Minimum value (shown as 0% bar width) |
| `max` | number | `100` | Maximum value (shown as 100% bar width) |
| `height` | number | `38` | Bar height in pixels |
| `unit` | string | — | Override the unit of measurement |

### Entity Options

Each item in `entities` accepts all card-level options above as overrides, plus:

| Option | Type | Description |
|---|---|---|
| `entity` | string | **Required.** The Home Assistant entity ID |
| `name` | string | Display name (defaults to the entity's friendly name) |
| `icon` | string | Any MDI icon e.g. `mdi:thermometer` |

---

## Colour Modes

### `gradient`
Smoothly blends the bar colour from green → orange → red as the value rises from `min` to `max`. No extra configuration needed.

```yaml
color_mode: gradient
```

### `severity`
Defines hard colour bands using `from` and `to` percentage values (0–100, relative to `min`/`max`):

```yaml
color_mode: severity
severity:
  - from: 0
    to: 33
    color: '#4CAF50'
  - from: 33
    to: 75
    color: '#FF9800'
  - from: 75
    to: 100
    color: '#F44336'
```

### `single`
A single fixed colour for the bar regardless of value:

```yaml
color_mode: single
color: '#4a9eff'
```

---

## Label Positions

| Value | Description |
|---|---|
| `left` | Name fixed on the left, value on the right — all bars start at the same position |
| `above` | Name on the left above the bar, value on the right above the bar |
| `inside` | Name and value rendered inside the bar — best with a taller `height` |
| `off` | No name label — value still shown on the right |

---

## Peak Marker

When `show_peak: true` is set, the card tracks the highest value seen since the page was loaded and displays it as a subtle marker directly on the bar — a small downward chevron (▼) at the top with a vertical line dropping through the bar.

This is useful for catching brief spikes you might otherwise miss, for example a kettle or appliance switching on momentarily.

> **Note:** The peak value resets when the page is reloaded as it is stored in memory only.

---

## Examples

---

### Basic — Single Sensor

The simplest possible config. One entity, default severity colour mode, label on the left.

![Basic single sensor](images/example-basic.png)

```yaml
type: custom:sensor-bar-card
title: Caravan Power
entities:
  - entity: sensor.sonoffpowr320d01_energy_power
    name: Caravan
    icon: mdi:caravan
    max: 3000
```

---

### Colour Mode: Gradient

Smooth colour transition from green through orange to red as value rises. No severity bands needed.

![Gradient colour mode](images/example-gradient.png)

```yaml
type: custom:sensor-bar-card
title: Gradient Colour Mode
color_mode: gradient
label_position: left
entities:
  - entity: sensor.sonoffpowr320d01_energy_power
    name: Low Usage
    icon: mdi:sine-wave
    max: 3000
  - entity: sensor.sonoffpowr320d01_energy_power
    name: Medium Usage
    icon: mdi:sine-wave
    max: 500
  - entity: sensor.sonoffpowr320d01_energy_power
    name: High Usage
    icon: mdi:sine-wave
    max: 150
```

---

### Colour Mode: Severity Bands

Hard colour bands that change at defined thresholds. Great for showing clearly when something is in a good, warning, or critical state.

![Severity colour mode](images/example-severity.png)

```yaml
type: custom:sensor-bar-card
title: Severity Colour Mode
color_mode: severity
label_position: left
severity:
  - from: 0
    to: 33
    color: '#4CAF50'
  - from: 33
    to: 75
    color: '#FF9800'
  - from: 75
    to: 100
    color: '#F44336'
entities:
  - entity: sensor.sonoffpowr320d01_energy_power
    name: Low Usage
    icon: mdi:sine-wave
    max: 3000
  - entity: sensor.sonoffpowr320d01_energy_power
    name: Medium Usage
    icon: mdi:sine-wave
    max: 500
  - entity: sensor.sonoffpowr320d01_energy_power
    name: High Usage
    icon: mdi:sine-wave
    max: 150
```

---

### Colour Mode: Single Colour

One fixed colour for all bars regardless of value. Good for battery levels or any sensor where you just want clean consistent styling.

![Single colour mode](images/example-single.png)

```yaml
type: custom:sensor-bar-card
title: Single Colour Mode
label_position: left
entities:
  - entity: sensor.sonoffpowr320d01_energy_power
    name: Blue
    icon: mdi:sine-wave
    max: 3000
    color_mode: single
    color: '#4a9eff'
  - entity: sensor.sonoffpowr320d01_energy_power
    name: Green
    icon: mdi:sine-wave
    max: 3000
    color_mode: single
    color: '#4CAF50'
  - entity: sensor.sonoffpowr320d01_energy_power
    name: Purple
    icon: mdi:sine-wave
    max: 3000
    color_mode: single
    color: '#9c27b0'
```

---

### Label Position: Left (Default)

Name fixed-width on the left, value on the right. All bars start at the same horizontal position regardless of name length — the best choice when displaying multiple sensors together.

![Label position left](images/example-label-left.png)

```yaml
type: custom:sensor-bar-card
title: Label Position — Left
color_mode: gradient
label_position: left
entities:
  - entity: sensor.sonoffpowr320d01_energy_power
    name: Caravan
    icon: mdi:caravan
    max: 3000
  - entity: sensor.sonoffpowr320d01_energy_power
    name: Fridge
    icon: mdi:fridge
    max: 200
  - entity: sensor.sonoffpowr320d01_energy_power
    name: Lighting
    icon: mdi:lightbulb
    max: 100
```

---

### Label Position: Above

Name and value shown above the bar. Good when you want more vertical breathing room between rows.

![Label position above](images/example-label-above.png)

```yaml
type: custom:sensor-bar-card
title: Label Position — Above
color_mode: gradient
label_position: above
entities:
  - entity: sensor.sonoffpowr320d01_energy_power
    name: Caravan
    icon: mdi:caravan
    max: 3000
  - entity: sensor.sonoffpowr320d01_energy_power
    name: Fridge
    icon: mdi:fridge
    max: 200
```

---

### Label Position: Inside

Name and value rendered inside the bar itself. Works best with a taller bar height.

![Label position inside](images/example-label-inside.png)

```yaml
type: custom:sensor-bar-card
title: Label Position — Inside
color_mode: gradient
label_position: inside
height: 48
entities:
  - entity: sensor.sonoffpowr320d01_energy_power
    name: Caravan
    icon: mdi:caravan
    max: 3000
  - entity: sensor.sonoffpowr320d01_energy_power
    name: Fridge
    icon: mdi:fridge
    max: 200
```

---

### Label Position: Off

No name label at all — value still shows on the right. Useful for very compact dashboards or when the card title is sufficient context.

![Label position off](images/example-label-off.png)

```yaml
type: custom:sensor-bar-card
title: Label Position — Off
color_mode: gradient
label_position: off
entities:
  - entity: sensor.sonoffpowr320d01_energy_power
    icon: mdi:caravan
    max: 3000
  - entity: sensor.sonoffpowr320d01_energy_power
    icon: mdi:fridge
    max: 200
  - entity: sensor.sonoffpowr320d01_energy_power
    icon: mdi:lightbulb
    max: 100
```

---

### Peak Marker

When `show_peak: true`, a subtle chevron and vertical line marks the highest value seen since the page loaded. Useful for spotting brief spikes you might otherwise miss.

![Peak marker](images/example-peak.png)

```yaml
type: custom:sensor-bar-card
title: Peak Marker
color_mode: gradient
label_position: left
show_peak: true
entities:
  - entity: sensor.sonoffpowr320d01_energy_power
    name: With Peak
    icon: mdi:caravan
    max: 3000
  - entity: sensor.sonoffpowr320d01_energy_power
    name: Without Peak
    icon: mdi:caravan
    max: 3000
    show_peak: false
```

---

### Bar Height Variations

Adjust `height` to make bars taller or more compact. Can be set globally or per entity.

![Bar height variations](images/example-heights.png)

```yaml
type: custom:sensor-bar-card
title: Bar Heights
color_mode: gradient
label_position: left
entities:
  - entity: sensor.sonoffpowr320d01_energy_power
    name: 24px — Compact
    icon: mdi:minus
    max: 3000
    height: 24
  - entity: sensor.sonoffpowr320d01_energy_power
    name: 38px — Default
    icon: mdi:minus
    max: 3000
    height: 38
  - entity: sensor.sonoffpowr320d01_energy_power
    name: 52px — Tall
    icon: mdi:minus
    max: 3000
    height: 52
  - entity: sensor.sonoffpowr320d01_energy_power
    name: 70px — Chunky
    icon: mdi:minus
    max: 3000
    height: 70
```

---

### Per-Entity Overrides

Every global option can be overridden per entity. This example uses a global gradient, but overrides the colour mode, height, and label position individually on some entities.

![Per-entity overrides](images/example-overrides.png)

```yaml
type: custom:sensor-bar-card
title: Per-Entity Overrides
color_mode: gradient
label_position: left
animated: true
show_peak: false
entities:
  - entity: sensor.sonoffpowr320d01_energy_power
    name: Default (inherits all globals)
    icon: mdi:caravan
    max: 3000
  - entity: sensor.sonoffpowr320d01_energy_power
    name: Single blue + peak on
    icon: mdi:fridge
    max: 3000
    color_mode: single
    color: '#4a9eff'
    show_peak: true
  - entity: sensor.sonoffpowr320d01_energy_power
    name: Severity + label above
    icon: mdi:lightbulb
    max: 3000
    color_mode: severity
    label_position: above
    severity:
      - from: 0
        to: 33
        color: '#4CAF50'
      - from: 33
        to: 75
        color: '#FF9800'
      - from: 75
        to: 100
        color: '#F44336'
  - entity: sensor.sonoffpowr320d01_energy_power
    name: Tall + inside label
    icon: mdi:television
    max: 3000
    height: 52
    label_position: inside
```

---

### Temperature Monitoring

Colour bands tuned for comfortable room temperature ranges.

![Temperature monitoring](images/example-temperature.png)

```yaml
type: custom:sensor-bar-card
title: Temperatures
color_mode: severity
label_position: left
min: 0
max: 40
severity:
  - from: 0
    to: 45
    color: '#4a9eff'
  - from: 45
    to: 60
    color: '#4CAF50'
  - from: 60
    to: 100
    color: '#F44336'
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

### Humidity Monitoring

Colour bands showing dry, ideal, and humid ranges.

![Humidity monitoring](images/example-humidity.png)

```yaml
type: custom:sensor-bar-card
title: Humidity
color_mode: severity
label_position: left
min: 0
max: 100
severity:
  - from: 0
    to: 30
    color: '#FF9800'
  - from: 30
    to: 60
    color: '#4CAF50'
  - from: 60
    to: 100
    color: '#4a9eff'
entities:
  - entity: sensor.living_room_humidity
    name: Living Room
    icon: mdi:sofa
  - entity: sensor.bedroom_humidity
    name: Bedroom
    icon: mdi:bed
  - entity: sensor.bathroom_humidity
    name: Bathroom
    icon: mdi:shower
```

---

### Battery Levels

Critical, low, and good colour bands for monitoring device batteries.

![Battery levels](images/example-battery.png)

```yaml
type: custom:sensor-bar-card
title: Battery Levels
color_mode: severity
label_position: left
min: 0
max: 100
severity:
  - from: 0
    to: 20
    color: '#F44336'
  - from: 20
    to: 50
    color: '#FF9800'
  - from: 50
    to: 100
    color: '#4CAF50'
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

## Contributing

Pull requests and issues are welcome! Please open an issue before submitting major changes.

1. Fork the repository
2. Make your changes to `dist/sensor-bar-card.js`
3. Test in Home Assistant
4. Open a pull request

---

## License

[MIT](LICENSE)