package ar.com.clearxuper.tv;

import android.app.Activity;
import android.app.Dialog;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.content.res.Configuration;
import android.content.pm.ActivityInfo;
import android.net.Uri;
import android.os.Bundle;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.*;
import android.widget.Toast;
import androidx.webkit.WebViewAssetLoader;
import androidx.media3.common.MediaItem;
import androidx.media3.common.PlaybackException;
import androidx.media3.common.Player;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.ui.PlayerView;

public class MainActivity extends Activity {
    private WebView web;
    private ExoPlayer player;
    private Dialog dialog;
    private PlayerView playerView;
    private boolean foreground;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        web = new WebView(this);
        setContentView(web);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(false);
        web.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !("https".equals(request.getUrl().getScheme())
                    && "appassets.androidplatform.net".equals(request.getUrl().getHost()));
            }
        });
        web.addJavascriptInterface(new Object() {
            @JavascriptInterface public void play(String url, String name) {
                runOnUiThread(() -> openPlayer(url, name));
            }
            @JavascriptInterface public void openDonation() {
                runOnUiThread(() -> {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://monedita.ar/cristalcleariptv")));
                    } catch (ActivityNotFoundException | SecurityException error) {
                        Toast.makeText(MainActivity.this, "No se pudo abrir un navegador. Escaneá el QR para colaborar.", Toast.LENGTH_LONG).show();
                    }
                });
            }
            @JavascriptInterface public void stop() { runOnUiThread(() -> closePlayer()); }
        }, "AndroidPlayer");
        web.loadUrl("https://appassets.androidplatform.net/assets/www/index.html");
    }

    private void openPlayer(String url, String name) {
        Uri uri = Uri.parse(url);
        if (!("https".equals(uri.getScheme()) || "http".equals(uri.getScheme())) || uri.getHost() == null) return;
        closePlayer();
        player = new ExoPlayer.Builder(this).build();
        final ExoPlayer openedPlayer = player;
        playerView = new PlayerView(this);
        playerView.setPlayer(player);
        // Ocultar los controles después de 3 segundos; un toque vuelve a mostrarlos.
        playerView.setControllerShowTimeoutMs(3000);
        playerView.setControllerHideOnTouch(true);
        playerView.setControllerAutoShow(true);
        dialog = new Dialog(this, android.R.style.Theme_Material_NoActionBar_Fullscreen);
        dialog.setContentView(playerView);
        dialog.setOnDismissListener(d -> {
            applyKeepScreenOn(false);
            dialog = null;
            releasePlayer();
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        });
        dialog.show();
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
        resizePlayerWindow();
        playerView.requestFocus();
        player.addListener(new Player.Listener() {
            @Override public void onEvents(Player eventPlayer, Player.Events events) {
                if (player == eventPlayer) updateKeepScreenOn();
            }
            @Override public void onPlayerError(PlaybackException error) {
                if (player != openedPlayer) return;
                updateKeepScreenOn();
                Toast.makeText(MainActivity.this, "No se pudo reproducir la señal: " + error.getErrorCodeName(), Toast.LENGTH_LONG).show();
            }
        });
        player.setMediaItem(MediaItem.fromUri(uri));
        player.prepare();
        player.play();
        updateKeepScreenOn();
    }

    private void resizePlayerWindow() {
        if (dialog == null) return;
        Window window = dialog.getWindow();
        if (window != null) window.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
        if (playerView != null) playerView.requestLayout();
    }

    private void updateKeepScreenOn() {
        boolean active = foreground && player != null && player.getPlayWhenReady()
            && (player.getPlaybackState() == Player.STATE_BUFFERING || player.getPlaybackState() == Player.STATE_READY);
        applyKeepScreenOn(active);
    }

    private void applyKeepScreenOn(boolean keep) {
        if (playerView != null) playerView.setKeepScreenOn(keep);
        if (dialog != null && dialog.getWindow() != null) {
            if (keep) dialog.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            else dialog.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        }
    }

    private void releasePlayer() {
        applyKeepScreenOn(false);
        if (playerView != null) { playerView.setPlayer(null); playerView = null; }
        ExoPlayer previous = player;
        player = null;
        if (previous != null) previous.release();
    }

    private void closePlayer() {
        applyKeepScreenOn(false);
        Dialog previous = dialog;
        dialog = null;
        if (previous != null) { previous.setOnDismissListener(null); previous.dismiss(); }
        releasePlayer();
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
    }

    @Override public void onConfigurationChanged(Configuration configuration) {
        super.onConfigurationChanged(configuration);
        // Resize the existing dialog and surface; retain the same player, channel and playback position.
        resizePlayerWindow();
        updateKeepScreenOn();
    }

    @Override protected void onPause() {
        foreground = false;
        if (player != null) player.pause();
        applyKeepScreenOn(false);
        if (web != null) web.onPause();
        super.onPause();
    }

    @Override protected void onResume() {
        super.onResume();
        foreground = true;
        if (web != null) web.onResume();
        updateKeepScreenOn();
    }

    @Override protected void onDestroy() {
        closePlayer();
        if (web != null) { web.removeJavascriptInterface("AndroidPlayer"); web.destroy(); }
        super.onDestroy();
    }
}
