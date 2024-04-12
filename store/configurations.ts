import * as SecureStore from 'expo-secure-store';
import _ from 'lodash';
import { action, makeObservable, observable, reaction } from 'mobx';
import { ColorSchemeName } from 'react-native';

export type ConfigulationOptions = {
  theme?: ColorSchemeName;
  notifications: boolean;
  webLinkPreview: boolean;
  showTypingIndicator: boolean;
  blockUnknown: boolean;
  deliveryReports: boolean;
  enableBiometric: boolean;
  retentionPeriod: number;
};

class Configulations {
  config: ConfigulationOptions = {
    theme: 'light',
    notifications: true,
    webLinkPreview: true,
    showTypingIndicator: true,
    blockUnknown: true,
    deliveryReports: true,
    enableBiometric: true,
    retentionPeriod: 0,
  };
  error: unknown = null;

  constructor() {
    makeObservable(this, {
      config: observable,
      error: observable,
      update: action,
      init: action,
      setConfig: action,
      proxy: action,
    });

    this.init();
    reaction(
      () => this.config,
      (v) => {
        this.setConfig(v);
      },
    );
  }

  get(param: keyof ConfigulationOptions) {
    return !!this.config[param];
  }

  update(param: keyof ConfigulationOptions, value: boolean) {
    if (param === 'theme') {
      this.config[param] = !value as unknown as ColorSchemeName;
    } else this.config = _.assign({}, this.config, { [param]: value });
  }

  async init() {
    try {
      const value = await SecureStore.getItemAsync('config');
      this.proxy(() => (this.config = _.assign({}, this.config, value ? JSON.parse(value) : {})));
    } catch (e) {
      this.error = e;
    }
  }

  async setConfig(options: ConfigulationOptions) {
    try {
      await SecureStore.setItemAsync('config', JSON.stringify(this.config));
    } catch (e) {
      this.error = e;
    }
  }

  proxy(callback: () => void) {
    callback();
  }
}

export default new Configulations();
