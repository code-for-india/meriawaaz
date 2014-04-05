package controllers;

import com.fasterxml.jackson.databind.JsonNode;

import play.libs.F.Function;
import play.libs.WS;
import play.mvc.BodyParser;
import play.mvc.Controller;
import play.mvc.Http.RequestBody;
import play.mvc.Result;
import play.libs.Json;
import com.fasterxml.jackson.databind.JsonNode;
import play.mvc.BodyParser;


public class Application extends Controller {


    @SuppressWarnings("deprecation")
	public static Result directions(String source, String destination) {
    	String feedUrl = "http://maps.googleapis.com/maps/api/directions/json";
        return async(
          WS.url(feedUrl).setQueryParameter("sensor", "false")
          //.setQueryParameter("origin", "37.3909762,-122.0663274")
          //.setQueryParameter("destination", "37.3909762,-122.0663274")
          .setQueryParameter("origin", source)
          .setQueryParameter("destination", destination)
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
    public static Result reportIncident() {
      JsonNode json = request().body().asJson();
	   //   String name = json.findPath("name").textValue();
    //  if(name == null) {
      //  return badRequest("Missing parameter [name]");
      //} else {
        return ok("Hello " + json);
      }
    }

