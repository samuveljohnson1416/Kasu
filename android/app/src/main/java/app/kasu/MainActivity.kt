package app.kasu

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import app.kasu.ui.KasuApp
import app.kasu.ui.KasuTheme
import app.kasu.ui.KasuViewModel

class MainActivity : ComponentActivity() {
    private val model: KasuViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            KasuTheme {
                KasuApp(model)
            }
        }
    }
}
