import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
import * as SplashScreen from "expo-splash-screen"
import { AuthProvider } from '../context/auth'
import NavigationScreen from './navigationScreen'
import { useColorScheme } from 'react-native'

const Navigation = () => {
  
  const scheme = useColorScheme();

  // SplashScreen.preventAutoHideAsync();
  // setTimeout(SplashScreen.hideAsync, 2000);

  return (
    <NavigationContainer independent={true} >      
    {/* <NavigationContainer independent={true} theme={scheme === "dark" ? DarkTheme : DefaultTheme} >       */}
      <AuthProvider>
        <NavigationScreen />
      </AuthProvider>
    </NavigationContainer>
  )
}

export default Navigation