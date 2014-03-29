package controllers;

import play.*;
import play.mvc.*;
import java.net.*;
import java.io.InputStream;
import play.api.libs.json;

import views.html.*;

public class Application extends Controller {

    public static Result index() {

    	URLConnection con = new URL("http://maps.googleapis.com/maps/api/directions/json?sensor=false&origin=37.3909762,-122.0663274&destination=37.3909762,-122.0663274").openConnection();
		InputStream is = con.getInputStream();
		byte bytes[] = new byte[con.getContentLength()];
		is.read(bytes);
		is.close();
		//Toolkit tk = getToolkit();
		//map = tk.createImage(bytes);
		//k.prepareImage(map, -1, -1, null);

        return ok(Json.json(bytes));
    }

}
