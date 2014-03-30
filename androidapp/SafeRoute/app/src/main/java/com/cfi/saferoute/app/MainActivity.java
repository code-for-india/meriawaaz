package com.cfi.saferoute.app;

import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.SupportMapFragment;


import android.os.Bundle;
import android.app.Activity;
import android.content.Intent;
import android.view.Menu;
import android.view.View;
import android.widget.Button;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentActivity;

public class MainActivity extends FragmentActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        final Button selectRoute = (Button) findViewById(R.id.chooseSafeRoute);
		selectRoute.setOnClickListener(new View.OnClickListener() {

			@Override
			public void onClick(View arg0) {
				Intent intent = new Intent(MainActivity.this, SelectRoute.class);
				startActivity(intent);
			}
        	
         });
		final Button reportUnsafe = (Button) findViewById(R.id.reportUnsafeArea);
		reportUnsafe.setOnClickListener(new View.OnClickListener() {

			@Override
			public void onClick(View arg0) {
				Intent intent = new Intent(MainActivity.this, ReportUnsafeArea.class);
				startActivity(intent);
			}
        	
         });
//     // Getting reference to SupportMapFragment of the activity_main
//     			SupportMapFragment fm = (SupportMapFragment)getSupportFragmentManager().findFragmentById(R.id.map);
//     			
//     			// Getting Map for the SupportMapFragment
//     			GoogleMap mGoogleMap = fm.getMap();
     			
     	
    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        //getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }
    
}
