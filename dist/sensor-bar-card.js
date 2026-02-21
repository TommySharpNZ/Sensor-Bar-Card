/**
 * sensor-bar-card - A polished, configurable sensor bar card for Home Assistant
 *
 * Works great for: power, temperature, humidity, water flow, battery, CO2, and more.
 *
 * Installation:
 *   1. Copy this file to your HA config /www/ folder
 *   2. Add resource in Lovelace: /local/sensor-bar-card.js (type: module)
 *   3. Restart or refresh browser
 *
 * ─── Global config options (all can be overridden per entity) ───────────────
 *
 *   type: custom:sensor-bar-card
 *   title: My Sensors             # optional card title
 *   label_position: left          # left | above | inside | off
 *   color_mode: gradient          # gradient | severity | single
 *   color: '#4a9eff'              # bar colour when color_mode is 'single'
 *   animated: true                # smooth bar fill transition on value change
 *   show_peak: true               # show peak marker (highest value seen this session)
 *   min: 0                        # minimum value
 *   max: 100                      # maximum value
 *   height: 38                    # bar height in px
 *   unit: W                       # override unit of measurement
 *   severity:                     # colour bands, used when color_mode is 'severity'
 *     - from: 0
 *       to: 33
 *       color: '#4CAF50'
 *     - from: 33
 *       to: 75
 *       color: '#FF9800'
 *     - from: 75
 *       to: 100
 *       color: '#F44336'
 *
 * ─── Entity config (inherits globals, override any per entity) ──────────────
 *
 *   entities:
 *     - entity: sensor.my_sensor
 *       name: My Sensor           # display name
 *       icon: mdi:thermometer     # any mdi icon
 *       min: 0
 *       max: 100
 *       unit: °C
 *       height: 38
 *       label_position: left
 *       color_mode: gradient
 *       color: '#4a9eff'
 *       animated: true
 *       show_peak: true
 *       severity:
 *         - from: 0
 *           to: 50
 *           color: blue
 *
 * ─── Example configs ────────────────────────────────────────────────────────
 *
 *  Power monitoring:
 *   type: custom:sensor-bar-card
 *   title: Power Usage
 *   color_mode: gradient
 *   entities:
 *     - entity: sensor.kettle_power
 *       name: Kettle
 *       icon: mdi:kettle
 *       max: 3000
 *
 *  Temperature:
 *   type: custom:sensor-bar-card
 *   title: Temperatures
 *   color_mode: severity
 *   severity:
 *     - from: 0
 *       to: 18
 *       color: '#4a9eff'
 *     - from: 18
 *       to: 24
 *       color: '#4CAF50'
 *     - from: 24
 *       to: 40
 *       color: '#F44336'
 *   entities:
 *     - entity: sensor.living_room_temperature
 *       name: Living Room
 *       icon: mdi:sofa
 *       min: 0
 *       max: 40
 *
 *  Humidity:
 *   type: custom:sensor-bar-card
 *   title: Humidity
 *   color_mode: single
 *   color: '#4a9eff'
 *   entities:
 *     - entity: sensor.bathroom_humidity
 *       name: Bathroom
 *       icon: mdi:water-percent
 *       max: 100
 */

class SensorBarCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._peaks = {};
  }

  setConfig(config) {
    if (!config.entities && !config.entity) {
      throw new Error('You must define entities or entity');
    }
    this._config = {
      title: '',
      label_position: 'left',
      color_mode: 'severity',
      color: '#4a9eff',
      animated: true,
      show_peak: false,
      min: 0,
      max: 100,
      height: 38,
      severity: [
        { from: 0,  to: 33,  color: '#4CAF50' },
        { from: 33, to: 75,  color: '#FF9800' },
        { from: 75, to: 100, color: '#F44336' },
      ],
      ...config,
    };

    // Normalise single entity shorthand to array
    if (this._config.entity && !this._config.entities) {
      this._config.entities = [{ entity: this._config.entity }];
    }
    this._config.entities = this._config.entities.map(e =>
      typeof e === 'string' ? { entity: e } : e
    );

    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  // Merge global config with per-entity overrides
  _resolve(entityCfg) {
    const g = this._config;
    return {
      min:            entityCfg.min            ?? g.min,
      max:            entityCfg.max            ?? g.max,
      height:         entityCfg.height         ?? g.height,
      label_position: entityCfg.label_position ?? g.label_position,
      animated:       entityCfg.animated       ?? g.animated,
      color_mode:     entityCfg.color_mode     ?? g.color_mode,
      color:          entityCfg.color          ?? g.color,
      severity:       entityCfg.severity       ?? g.severity,
      show_peak:      entityCfg.show_peak      ?? g.show_peak,
      unit:           entityCfg.unit           ?? g.unit ?? null,
      icon:           entityCfg.icon           ?? null,
      name:           entityCfg.name           ?? null,
    };
  }

  _getColor(pct, ecfg) {
    if (ecfg.color_mode === 'single') return ecfg.color;

    if (ecfg.color_mode === 'gradient') {
      const stops = [
        { p: 0,   r: 76,  g: 175, b: 80  },
        { p: 50,  r: 255, g: 152, b: 0   },
        { p: 100, r: 244, g: 67,  b: 54  },
      ];
      let lo = stops[0], hi = stops[stops.length - 1];
      for (let i = 0; i < stops.length - 1; i++) {
        if (pct >= stops[i].p && pct <= stops[i + 1].p) {
          lo = stops[i]; hi = stops[i + 1]; break;
        }
      }
      const t = lo.p === hi.p ? 0 : (pct - lo.p) / (hi.p - lo.p);
      return `rgb(${Math.round(lo.r + t*(hi.r-lo.r))},${Math.round(lo.g + t*(hi.g-lo.g))},${Math.round(lo.b + t*(hi.b-lo.b))})`;
    }

    // Severity mode
    for (const s of (ecfg.severity || [])) {
      if (pct >= s.from && pct <= s.to) return s.color;
    }
    return ecfg.color;
  }

  _render() {
    const cfg = this._config;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family: 'Segoe UI', system-ui, sans-serif; }

        .card {
          background: var(--card-background-color, #fff);
          border-radius: 12px;
          padding: 16px;
          box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.08));
        }
        .card-title {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--secondary-text-color, #888);
          margin-bottom: 14px;
        }
        .row {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          gap: 10px;
          cursor: pointer;
          border-radius: 8px;
          padding: 2px 4px;
          transition: background 0.15s;
        }
        .row:last-child { margin-bottom: 0; }
        .row:hover { background: var(--secondary-background-color, rgba(0,0,0,0.04)); }

        .icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 28px;
          color: var(--primary-text-color, #333);
        }
        ha-icon { --mdc-icon-size: 20px; }

        .label-left {
          flex-shrink: 0;
          width: 100px;
          font-size: 13px;
          font-weight: 500;
          color: var(--primary-text-color, #333);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bar-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .bar-label-above {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--secondary-text-color, #888);
          margin-bottom: 2px;
        }
        .bar-track {
          position: relative;
          width: 100%;
          border-radius: 6px;
          background: var(--secondary-background-color, #e8e8e8);
          overflow: hidden;
        }
        .bar-fill {
          height: 100%;
          border-radius: 6px 0 0 6px;
          transition: width 0.6s cubic-bezier(0.4,0,0.2,1), background-color 0.4s ease;
          min-width: 4px;
          position: relative;
          z-index: 1;
        }
        .bar-fill.no-anim { transition: none; }

        .bar-inner-label {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 10px;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          white-space: nowrap;
          pointer-events: none;
          z-index: 2;
        }

        /* Peak marker — subtle, sits over bar via shared parent */
        .peak-marker {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          transform: translateX(-50%);
          z-index: 4;
          pointer-events: none;
          transition: left 0.6s cubic-bezier(0.4,0,0.2,1);
        }
        /* Vertical line — sharp, no rounded corners */
        .peak-marker .peak-line {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 2px;
          background: #888;
          z-index: 1;
        }
        /* Chevron at the top, on top of line */
        .peak-marker .peak-chevron {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid #888;
          z-index: 2;
        }

        .value-right {
          flex-shrink: 0;
          min-width: 58px;
          text-align: right;
          font-size: 13px;
          font-weight: 600;
          color: var(--primary-text-color, #333);
          font-variant-numeric: tabular-nums;
        }
        .value-right .unit {
          font-size: 11px;
          font-weight: 400;
          color: var(--secondary-text-color, #888);
          margin-left: 1px;
        }
      </style>

      <ha-card>
        <div class="card">
          ${cfg.title ? `<div class="card-title">${cfg.title}</div>` : ''}
          <div class="rows"></div>
        </div>
      </ha-card>
    `;

    this._update();
  }

  _buildRow(entityCfg, stateDisplay, unit, pct, color, peakPct, peakDisplay) {
    const ecfg = this._resolve(entityCfg);
    const lp   = ecfg.label_position;
    const h    = ecfg.height;
    const name = ecfg.name
      || this._hass?.states[entityCfg.entity]?.attributes?.friendly_name
      || entityCfg.entity;

    // Peak marker — subtle chevron at top with vertical line, no badge
    const peakMarker = ecfg.show_peak && peakPct !== null ? `
      <div class="peak-marker" style="left:${peakPct}%;">
        <div class="peak-chevron"></div>
        <div class="peak-line"></div>
      </div>` : '';

    const aboveLabel = lp === 'above' ? `
      <div class="bar-label-above">
        <span>${name}</span>
        <span>${stateDisplay}${unit ? ' ' + unit : ''}</span>
      </div>` : '';

    const innerLabel = lp === 'inside' ? `
      <div class="bar-inner-label">
        <span>${name}</span>
        <span>${stateDisplay}${unit ? ' ' + unit : ''}</span>
      </div>` : '';

    const leftLabel  = lp === 'left' ? `<div class="label-left">${name}</div>` : '';

    const rightValue = lp !== 'inside' && lp !== 'above'
      ? `<div class="value-right">${stateDisplay}${unit ? `<span class="unit"> ${unit}</span>` : ''}</div>`
      : '';

    return `
      <div class="row" data-entity="${entityCfg.entity}">
        ${ecfg.icon ? `<div class="icon-wrap"><ha-icon icon="${ecfg.icon}"></ha-icon></div>` : ''}
        ${leftLabel}
        <div class="bar-wrap">
          ${aboveLabel}
          <div style="position:relative;height:${h}px;">
            <div class="bar-track" style="position:absolute;inset:0;height:${h}px;">
              <div class="bar-fill${ecfg.animated ? '' : ' no-anim'}"
                style="width:${pct}%;background:${color};height:${h}px;${pct >= 97 ? 'border-radius:6px;' : ''}"></div>
              ${innerLabel}
            </div>
            ${peakMarker}
          </div>
        </div>
        ${rightValue}
      </div>`;
  }

  _update() {
    if (!this._hass || !this._config) return;
    const rowsEl = this.shadowRoot.querySelector('.rows');
    if (!rowsEl) return;

    let html = '';
    for (const entityCfg of this._config.entities) {
      const stateObj = this._hass.states[entityCfg.entity];
      if (!stateObj) {
        html += `<div class="row"><span style="color:var(--error-color,red);font-size:12px;">
          Entity not found: ${entityCfg.entity}</span></div>`;
        continue;
      }

      const ecfg    = this._resolve(entityCfg);
      const rawVal  = parseFloat(stateObj.state);
      const unit    = ecfg.unit ?? stateObj.attributes?.unit_of_measurement ?? '';
      const pct     = Math.min(100, Math.max(0, ((rawVal - ecfg.min) / (ecfg.max - ecfg.min)) * 100));
      const color   = this._getColor(pct, ecfg);
      const display = isNaN(rawVal) ? stateObj.state : rawVal.toLocaleString();

      // Track session peak per entity
      let peakPct = null, peakDisplay = null;
      if (ecfg.show_peak) {
        const key = entityCfg.entity;
        if (!isNaN(rawVal)) {
          if (this._peaks[key] === undefined || rawVal > this._peaks[key]) {
            this._peaks[key] = rawVal;
          }
        }
        const peakVal = this._peaks[key];
        if (peakVal !== undefined) {
          peakPct     = Math.min(100, Math.max(0, ((peakVal - ecfg.min) / (ecfg.max - ecfg.min)) * 100));
          peakDisplay = peakVal.toLocaleString();
        }
      }

      html += this._buildRow(entityCfg, display, unit, pct, color, peakPct, peakDisplay);
    }
    rowsEl.innerHTML = html;

    // Click opens the native HA entity more-info dialog
    rowsEl.querySelectorAll('.row[data-entity]').forEach(row => {
      row.addEventListener('click', () => {
        const entityId = row.getAttribute('data-entity');
        const event = new Event('hass-more-info', { bubbles: true, composed: true });
        event.detail = { entityId };
        this.dispatchEvent(event);
      });
    });
  }

  getCardSize() {
    return (this._config?.entities?.length || 1) + (this._config?.title ? 1 : 0);
  }
}

customElements.define('sensor-bar-card', SensorBarCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'sensor-bar-card',
  name: 'Sensor Bar Card',
  description: 'Configurable animated bar card for Home Assistant. Works with power, temperature, humidity, water flow, battery and more.',
});