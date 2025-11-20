import { createContext, ReactElement, useCallback } from 'react';

// project-imports
import config from 'config';
import useLocalStorage from 'hooks/useLocalStorage';
import { MenuOrientation, ThemeDirection, ThemeMode } from 'config';

// types
import { CustomizationProps, DefaultConfigProps, FontFamily, I18n, PresetColor } from 'types/config';

// initial state
const initialState: CustomizationProps = {
  ...config,
  onChangeContainer: () => {},
  onChangeLocalization: () => {},
  onChangeMode: () => {},
  onChangePresetColor: () => {},
  onChangeDirection: () => {},
  onChangeMiniDrawer: () => {},
  onChangeMenuOrientation: () => {},
  onChangeMenuCaption: () => {},
  onChangeFontFamily: () => {},
  onChangeContrast: () => {}
};

// ==============================|| CONFIG CONTEXT & PROVIDER ||============================== //

const ConfigContext = createContext(initialState);

type ConfigProviderProps = {
  children: ReactElement;
};

function ConfigProvider({ children }: ConfigProviderProps) {
  const [config, setConfig] = useLocalStorage('able-pro-material-next-ts-config', initialState);

  const onChangeContainer = useCallback(
    (container: string) => {
      setConfig((prev: DefaultConfigProps) => ({
        ...prev,
        container: container !== 'fluid'
      }));
    },
    [setConfig]
  );

  const onChangeLocalization = useCallback(
    (lang: I18n) => {
      setConfig((prev: DefaultConfigProps) => ({ ...prev, i18n: lang }));
    },
    [setConfig]
  );

  const onChangeMode = useCallback(
    (mode: ThemeMode) => {
      setConfig((prev: DefaultConfigProps) => ({ ...prev, mode }));
    },
    [setConfig]
  );

  const onChangePresetColor = useCallback(
    (theme: PresetColor) => {
      setConfig((prev: DefaultConfigProps) => ({ ...prev, presetColor: theme }));
    },
    [setConfig]
  );

  const onChangeDirection = useCallback(
    (direction: ThemeDirection) => {
      setConfig((prev: DefaultConfigProps) => ({ ...prev, themeDirection: direction }));
    },
    [setConfig]
  );

  const onChangeMiniDrawer = useCallback(
    (miniDrawer: boolean) => {
      setConfig((prev: DefaultConfigProps) => ({ ...prev, menuOrientation: MenuOrientation.VERTICAL, miniDrawer }));
    },
    [setConfig]
  );

  const onChangeMenuOrientation = useCallback(
    (layout: MenuOrientation) => {
      setConfig((prev: DefaultConfigProps) => ({
        ...prev,
        menuOrientation: layout,
        ...(layout === MenuOrientation.VERTICAL && { miniDrawer: false })
      }));
    },
    [setConfig]
  );

  const onChangeContrast = useCallback(
    (themeContrast: string) => {
      setConfig((prev: DefaultConfigProps) => ({ ...prev, themeContrast: themeContrast === 'contrast' }));
    },
    [setConfig]
  );

  const onChangeMenuCaption = useCallback(
    (menuCaption: string) => {
      setConfig((prev: DefaultConfigProps) => ({ ...prev, menuCaption: menuCaption === 'caption' }));
    },
    [setConfig]
  );

  const onChangeFontFamily = useCallback(
    (fontFamily: FontFamily) => {
      setConfig((prev: DefaultConfigProps) => ({ ...prev, fontFamily }));
    },
    [setConfig]
  );

  return (
    <ConfigContext.Provider
      value={{
        ...config,
        onChangeContainer,
        onChangeLocalization,
        onChangeMode,
        onChangePresetColor,
        onChangeDirection,
        onChangeMiniDrawer,
        onChangeMenuOrientation,
        onChangeMenuCaption,
        onChangeFontFamily,
        onChangeContrast
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export { ConfigProvider, ConfigContext };
