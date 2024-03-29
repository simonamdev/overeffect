var tick_delay = 1000;

image_types = [".png", ".jpg", ".bmp"];
audio_types = [".wav", ".mp3", ".ogg"];
video_types = [".mp4"];

time = setInterval(function(){
    $.get("http://127.0.0.1:5000/state", function(data) {
        var split_string = data.split(":");
        var state = split_string[0];
        console.log("Current state: " + split_string);
        if (state == "request") {
            var requested_file = split_string[1];
            var file_format = requested_file.split(".")[requested_file.split(".").length - 1];
            var file_timeout = parseFloat(split_string[2]) * 1000;
            // Set the state to busy
            console.log("Request received for: " + requested_file + " Going to busy state");
            var busy_url = "http://127.0.0.1:5000/set_busy_state/" + requested_file;
            $.get(busy_url);
						$("#content").empty();
						requested_file = "/static/assets/" + requested_file;
						$("#content").append(requested_file);
						// TODO: Put these in their own functions, but hey, it works for now
						// Determine if it is audio, a gif, an image or a video
						var is_audio = false;
						var is_image = false;
						var is_video = false;
						$.each(audio_types, function(index, value) {
								if (requested_file.indexOf(value) > -1) {
										is_audio = true;
								}
						});
						var is_image = $.each(image_types, function(index, value) {
								if (requested_file.indexOf(value) > -1) {
										is_image = true;
								}
						});
						var is_video = $.each(video_types, function(index, value) {
								if (requested_file.indexOf(value) > -1) {
										is_video = true;
								}
						});
						var is_gif = (requested_file.indexOf(".gif") > -1);
						// Act according to the file type
						if (is_audio) {
								console.log("Playing Audio");
								// Hide the visual
								// TODO: Remove if not needed after implementing clear state
								// $("#overlayImage").attr("width", "0%");
								var currentAudio = $("#overlayAudio");
								currentAudio.attr("src", requested_file);
								currentAudio.get(0).play();
								// Bind and event to it to end it after it finishes
								currentAudio.bind("ended", function() {
										console.log("Audio finished.");
										// Clear the state
										$.get("http://127.0.0.1:5000/set_clear_state/1");
								});
						} else if (is_gif) {
								console.log("Playing Gif");
								// Show the gif
								$("#overlayImage").attr("width", "100%");
								// Set the source to the requested file
								$("#overlayImage").attr("src", requested_file);
								setTimeout(function() {
										console.log("Timeout for " + requested_file + " of " + file_timeout + "ms finished.");
										$("#overlayImage").attr("src", "");
										$("#overlayImage").attr("width", "0%");
										// Clear the state
										$.get("http://127.0.0.1:5000/set_clear_state/1");
								}, file_timeout);
						} else if (is_image) {
								console.log("Showing Image");
								// Show the image
								$("#overlayImage").attr("width", "100%");
								// Set the source to the requested file
								$("#overlayImage").attr("src", requested_file);
						} else if (is_video) {
								console.log("Playing Video");
								// TODO: Fill in for video files
						} else {
								console.log("ERROR: Unrecognized file type or could not determine file type");
						}
        } else if (state == "clear") {
            // If the  request state is not for a new request, just clear the content.
            console.log("Clearing current content");
            $("#overlayImage").attr("width", "0%");
            $("#overlayImage").attr("src", "");
            $("#overlayAudio").attr("src", "");
            // Reset the state to ready
            console.log("Resetting state to ready");
						$.get("http://127.0.0.1:5000/reset_state");
        }
    });
}, tick_delay);