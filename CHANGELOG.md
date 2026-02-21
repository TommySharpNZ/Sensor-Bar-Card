# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2025-02-21

### Initial release

#### Display
- Animated horizontal bar display for any Home Assistant numeric sensor
- Smooth bar width and colour transitions on value change (`animated`, default `true`)
- Configurable bar height in pixels, globally or per entity (`height`, default `38`)

#### Colour Modes
- **Gradient** — smooth green → orange → red transition from `min` to `max`
- **Severity bands** — hard colour thresholds defined by percentage ranges (`from` / `to`)
- **Single colour** — one fixed colour regardless of value (`color`)

#### Label Positions
- **Left** — fixed-width name column on the left, value on the right (default)
- **Above** — name and value displayed above the bar
- **Inside** — name and value rendered inside the bar itself
- **Off** — no name label, value still shown on the right

#### Icons
- Automatic icon resolution — falls back to the entity's own HA icon if none is specified
- Explicit MDI icon override per entity (`icon: mdi:something`)
- Icon can be hidden entirely with no reserved space (`icon: false`)

#### Markers
- **Peak marker** — tracks the session high and marks it with a downward chevron (▼) at the top of the bar (`show_peak`, `peak_color`)
- **Target marker** — fixed goal or threshold shown as an upward chevron (▲) at the bottom of the bar (`target`, `target_color`)
- Peak and target markers can appear simultaneously on the same bar and are independently coloured

#### Value Display
- Decimal places control for displayed value (`decimal`) — defaults to raw sensor value
- Unit of measurement override (`unit`) — defaults to the sensor's reported unit
- Locale-aware number formatting

#### Behaviour
- Click any bar row to open the native Home Assistant more-info dialog for that entity
- Missing or unavailable entities display an inline error message without crashing the card
- Per-entity overrides — every option can be set globally at the card level and overridden per entity
- Peak values stored in memory only — reset on page reload