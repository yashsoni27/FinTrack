import { NavigationContainer } from '@react-navigation/native'
import { AuthProvider } from '../context/auth'
import NavigationScreen from './navigationScreen'

const Navigation = () => {    

  return (
    <NavigationContainer independent={true} >          
      <AuthProvider>
        <NavigationScreen />
      </AuthProvider>
    </NavigationContainer>
  )
}

export default Navigation