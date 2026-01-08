import { Text, StyleSheet, StatusBar, Platform} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function WatchlistScreen() {
    return(
        <SafeAreaView>
            
            <Text>Watchlist screen</Text>

            {/*<StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />*/}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({

})