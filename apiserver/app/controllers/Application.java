package controllers;

import play.libs.F.Function;
import play.libs.WS;
import play.mvc.BodyParser;
import play.mvc.Controller;
import play.mvc.Http.RequestBody;
import play.mvc.Result;


public class Application extends Controller {


    @SuppressWarnings("deprecation")
	public static Result directions() {
    	String feedUrl = "http://maps.googleapis.com/maps/api/directions/json";
        return async(
          WS.url(feedUrl).setQueryParameter("sensor", "false")
          .setQueryParameter("origin", "37.3909762,-122.0663274")
          .setQueryParameter("destination", "37.3909762,-122.0663274")
          .get().map(
            new Function<WS.Response, Result>() {
              public Result apply(WS.Response response) {
            //	response.getBody().  
                return ok(response.asJson());
              }
            }
          )
        );
      }
    
    @BodyParser.Of(BodyParser.Json.class)
    public static Result reportIncident(String name) {
    	
    	 RequestBody body = request().body();
    	return  ok("Got json: " + body.asJson());
       //return ok(Json.toJson(body));
        //String v = getAccountId(request().getHeader("Authorization"));
      // JsonNode json = request().body().asJson();
     //  json.f
       // String name = json.findPath("name").textValue();
          //  return ok(Json.toJson(name));
        }
}
