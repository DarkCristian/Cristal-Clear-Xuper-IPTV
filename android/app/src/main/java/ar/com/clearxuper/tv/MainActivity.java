package ar.com.clearxuper.tv;
import android.app.Activity;import android.app.Dialog;import android.os.Bundle;import android.webkit.*;import android.net.Uri;import android.view.ViewGroup;import android.view.Window;import android.widget.Toast;
import androidx.webkit.WebViewAssetLoader;import androidx.media3.common.MediaItem;import androidx.media3.common.PlaybackException;import androidx.media3.common.Player;import androidx.media3.exoplayer.ExoPlayer;import androidx.media3.ui.PlayerView;
public class MainActivity extends Activity {
 private WebView web;private ExoPlayer player;private Dialog dialog;
 @Override public void onCreate(Bundle state){super.onCreate(state);web=new WebView(this);setContentView(web);web.getSettings().setJavaScriptEnabled(true);web.getSettings().setDomStorageEnabled(true);web.getSettings().setAllowFileAccess(false);web.getSettings().setAllowContentAccess(false);web.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
 final WebViewAssetLoader loader=new WebViewAssetLoader.Builder().addPathHandler("/assets/",new WebViewAssetLoader.AssetsPathHandler(this)).build();
 web.setWebViewClient(new WebViewClient(){@Override public WebResourceResponse shouldInterceptRequest(WebView v,WebResourceRequest r){return loader.shouldInterceptRequest(r.getUrl());}@Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){return !("https".equals(r.getUrl().getScheme())&&"appassets.androidplatform.net".equals(r.getUrl().getHost()));}});
 web.addJavascriptInterface(new Object(){@JavascriptInterface public void play(String url,String name){runOnUiThread(()->openPlayer(url,name));}@JavascriptInterface public void stop(){runOnUiThread(()->closePlayer());}},"AndroidPlayer");web.loadUrl("https://appassets.androidplatform.net/assets/www/index.html");}
 private void openPlayer(String url,String name){Uri u=Uri.parse(url);if(!("https".equals(u.getScheme())||"http".equals(u.getScheme()))||u.getHost()==null)return;closePlayer();
 player=new ExoPlayer.Builder(this).build();PlayerView view=new PlayerView(this);view.setPlayer(player);dialog=new Dialog(this,android.R.style.Theme_Material_NoActionBar_Fullscreen);dialog.setContentView(view);dialog.setOnDismissListener(d->{if(player!=null){player.release();player=null;}});dialog.show();Window w=dialog.getWindow();if(w!=null)w.setLayout(ViewGroup.LayoutParams.MATCH_PARENT,ViewGroup.LayoutParams.MATCH_PARENT);view.requestFocus();
 player.addListener(new Player.Listener(){@Override public void onPlayerError(PlaybackException e){Toast.makeText(MainActivity.this,"No se pudo reproducir la señal: "+e.getErrorCodeName(),Toast.LENGTH_LONG).show();}});player.setMediaItem(MediaItem.fromUri(u));player.prepare();player.play();}
 private void closePlayer(){if(dialog!=null){dialog.dismiss();dialog=null;}if(player!=null){player.release();player=null;}}
 @Override protected void onPause(){super.onPause();if(player!=null)player.pause();web.onPause();}
 @Override protected void onResume(){super.onResume();if(web!=null)web.onResume();}
 @Override protected void onDestroy(){closePlayer();web.removeJavascriptInterface("AndroidPlayer");web.destroy();super.onDestroy();}
}
