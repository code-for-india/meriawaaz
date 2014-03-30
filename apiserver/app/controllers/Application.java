package controllers;

import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;

import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;

public class Application extends Controller {

    public static Result index() throws Exception {

    	URLConnection con = new URL("http://maps.googleapis.com/maps/api/directions/json?sensor=false&origin=37.3909762,-122.0663274&destination=37.3909762,-122.0663274").openConnection();
  		InputStream is = con.getInputStream();
        byte bytes[] = new byte[]{};
        if (con.getContentLength() != -1) {
          bytes = new byte[con.getContentLength()];
        }
  		is.read(bytes);
  		is.close();
  		//Toolkit tk = getToolkit();
  		//map = tk.createImage(bytes);
  		//k.prepareImage(map, -1, -1, null);

      return ok(Json.toJson(bytes));
    }

}
