var jacopo = {

  refresh_rate: 60 * 60 * 1000,
  default_calendar_url: 'http://calendaraboutnothing.com/~',
  
  refresh_timer: undefined,
  

  fetch_from_calendar_url: function() {
    var self = this;
    if (localStorage['calendar_url'] === undefined || localStorage['calendar_url'] === this.default_calendar_url) {
      localStorage['calendar_url'] = this.default_calendar_url;
    } else {    
      $.ajax({  
        url: localStorage['calendar_url'],  
        success: function(data) { 
          self.calendar_data_response(data);
        }  
      });
    }
  },
  
  
  calendar_data_response: function(data) {
    // Streak
    localStorage['current_streak'] = parseInt($(".current_streak span.num", data).html(), 10);
    
    // Get Progress Today
    if ($(".progressed.today", data).length > 0) {
      localStorage['progressed_today'] = 'true';
    } else {
      localStorage['progressed_today'] = 'false';
    }
       
    // Show notification
    if (localStorage['show_notification'] === 'true' && localStorage['progressed_today'] === 'false') {
      var current_time = new Date();
      var time_left_hours = 24 - current_time.getHours();
    	//var time_left_minutes = 60 - current_time.getMinutes();
      
      var notification = webkitNotifications.createNotification(
        'icon.png',
        "Don't break your streak.",
        'You have not completed your contribution to open source today. You have less than ' + time_left_hours + ' hours remaining.'
      );
      notification.show();
    }
    
    this.update_interface();
  },
  
  
  update_interface: function() {
    var self = this;
    
    // Update Badge
    if (localStorage['show_badge'] === 'true') {
      chrome.browserAction.setBadgeText({text: localStorage['current_streak']});
    } else {
      chrome.browserAction.setBadgeText({text: ""});
    }
    
    // Update Progress
    if (localStorage['progressed_today'] === 'true') {
      chrome.browserAction.setIcon({path: "icon_green.png"});
      chrome.browserAction.setBadgeBackgroundColor({color:[0,255,0,255]});
    } else {
      chrome.browserAction.setIcon({path: "icon.png"});
      chrome.browserAction.setBadgeBackgroundColor({color:[255,0,0,255]});
    }
  },
  
  
  schedule_refresh: function() {
    var self = this;
    if (this.refresh_timer) {
      clearInterval(this.refresh_timer);
    }
    this.refresh_timer = setInterval(function(){ self.update(); }, this.refresh_rate);
  },
  
  
  update: function() {
    console.log("UPDATED AT: "+(Math.round(new Date().getTime() / 1000)));
    
    // A simple scrape of the page will do for now.
    // We'll authenticate to github for faster results in the future.
    this.fetch_from_calendar_url();
  },

  init: function() {
    this.schedule_refresh();
    this.update();
  }
};


$(document).ready(function(){
  jacopo.init();
  
  // listen_for_storage_updates
  window.addEventListener("storage", function(event){
    if (event.key === 'calendar_url') {
      jacopo.schedule_refresh();
      jacopo.update();
    } else {
      jacopo.update_interface();
    }
  }, false);
});