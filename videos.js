// Generated by CoffeeScript 1.6.1
(function() {
  var Node, debugReport, sizeOfArray, status, typeIsArray;

  typeIsArray = function(value) {
    return value && typeof value === 'object' && value instanceof Array && typeof value.length === 'number' && typeof value.splice === 'function' && !(value.propertyIsEnumerable('length'));
  };

  status = "";

  debugReport = function(string) {
    status += string + "<br>";
    return $('#status').html(status);
  };

  sizeOfArray = 5;

  Node = (function() {

    function Node() {
      var data, vg;
      switch (arguments.length) {
        case 5:
          this.video = arguments[0];
          this.nodes = arguments[1];
          this.is_group = arguments[2];
          this.parent = arguments[3];
          this.parent_position = arguments[4];
          this.title = arguments[5];
          return;
        case 1:
          debugReport("Processing main data");
          data = arguments[0];
          this.video = null;
          this.nodes = (function() {
            var _i, _ref, _results;
            _results = [];
            for (vg = _i = 0, _ref = data.length; 0 <= _ref ? _i < _ref : _i > _ref; vg = 0 <= _ref ? ++_i : --_i) {
              _results.push(new Node(data[vg], this, vg));
            }
            return _results;
          }).call(this);
          if (data.length !== 25) {
            debugReport("Data length invalid");
          }
          debugReport("Processed " + this.nodes.length + " nodes");
          this.is_group = true;
          this.parent = null;
          this.parent_position = -1;
          this.cur_x = 0;
          this.cur_y = 0;
          return;
        case 3:
          data = arguments[0];
          if ('video' in data) {
            debugReport("Processing video " + data.video);
            this.video = data.video;
            this.nodes = null;
            this.is_group = false;
            this.parent = arguments[1];
            this.parent_position = arguments[2];
            this.title = null;
          } else if ('group' in data) {
            this.video = null;
            this.nodes = (function() {
              var _i, _ref, _results;
              _results = [];
              for (vg = _i = 0, _ref = data.group.length; 0 <= _ref ? _i < _ref : _i > _ref; vg = 0 <= _ref ? ++_i : --_i) {
                _results.push(new Node(data.group[vg], this, vg));
              }
              return _results;
            }).call(this);
            if (data.group.length !== 25) {
              debugReport("Group length invalid");
            }
            this.title = data.title;
            this.is_group = true;
            this.parent = arguments[1];
            this.parent_position = arguments[2];
            this.cur_x = 0;
            this.cur_y = 0;
          }
          return;
      }
    }

    Node.prototype.getParentPosition = function() {
      return [Math.floor(this.parent_position / 5), this.parent_position % 5];
    };

    Node.prototype.getNode = function(a, b) {
      return this.nodes[a * 5 + b];
    };

    Node.prototype.getCurrentNode = function() {
      return this.getNode(this.cur_x, this.cur_y);
    };

    Node.prototype.isGroup = function() {
      return this.is_group;
    };

    Node.prototype.videoUrl = function() {
      return "http://www.youtube.com/v/" + this.video + "?version=3&enablejsapi=1&playerapiid=ytplayer";
    };

    Node.prototype.coords = function(x, y) {
      return "player_" + x + "_" + y;
    };

    Node.prototype.currentCoords = function() {
      return this.coords(this.cur_x, this.cur_y);
    };

    Node.prototype.jqueryId = function(x, y) {
      return "#" + this.coords(x, y);
    };

    Node.prototype.currentJqueryId = function() {
      return this.jqueryId(this.cur_x, this.cur_y);
    };

    Node.prototype.loadIntoGrid = function(x, y) {
      var atts, params;
      debugReport("Loading into grid: " + x + ", " + y);
      if (this.getNode(x, y).isGroup()) {
        return $("#div_apiplayer_" + x + "_" + y).html(this.getNode(x, y).title);
      } else {
        $("#div_apiplayer_" + x + "_" + y).html("<div id=\"player_" + x + "_" + y + "\"></div>");
        params = {
          allowScriptAccess: 'always'
        };
        atts = {
          id: this.coords(x, y)
        };
        return swfobject.embedSWF(this.getNode(x, y).videoUrl(), "player_" + x + "_" + y, "200", "200", "8", null, null, params, atts);
      }
    };

    Node.prototype.loadAll = function() {
      var c, d, _i, _results;
      debugReport("Loading all");
      debugReport("Parent is " + (this.parent === null));
      _results = [];
      for (c = _i = 0; 0 <= sizeOfArray ? _i < sizeOfArray : _i > sizeOfArray; c = 0 <= sizeOfArray ? ++_i : --_i) {
        _results.push((function() {
          var _j, _results1;
          _results1 = [];
          for (d = _j = 0; 0 <= sizeOfArray ? _j < sizeOfArray : _j > sizeOfArray; d = 0 <= sizeOfArray ? ++_j : --_j) {
            _results1.push(this.loadIntoGrid(c, d));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Node.prototype.setActive = function(x, y) {
      var c, d, _i, _j;
      debugReport("" + x + ", " + y + " active");
      this.cur_x = x;
      this.cur_y = y;
      for (c = _i = 0; 0 <= sizeOfArray ? _i < sizeOfArray : _i > sizeOfArray; c = 0 <= sizeOfArray ? ++_i : --_i) {
        for (d = _j = 0; 0 <= sizeOfArray ? _j < sizeOfArray : _j > sizeOfArray; d = 0 <= sizeOfArray ? ++_j : --_j) {
          $("#apiplayer_" + c + "_" + d).css('background-color', 'white');
        }
      }
      return $("#apiplayer_" + x + "_" + y).css('background-color', 'red');
    };

    Node.prototype.playVideo = function(x, y) {
      return $(this.jqueryId(x, y))[0].playVideo();
    };

    Node.prototype.playCurrentVideo = function() {
      return this.playVideo(this.cur_x, this.cur_y);
    };

    Node.prototype.pauseVideo = function(x, y) {
      return $(this.jqueryId(x, y))[0].pauseVideo();
    };

    Node.prototype.pauseCurrentVideo = function() {
      debugReport("" + this.cur_x + ", " + this.cur_y + " pausing");
      try {
        return this.pauseVideo(this.cur_x, this.cur_y);
      } catch (error) {
        return debugReport(error);
      }
    };

    Node.prototype.endVideo = function(x, y) {
      this.pauseVideo(x, y);
      return $(this.jqueryId(x, y))[0].seekTo(0, true);
    };

    Node.prototype.endCurrentVideo = function() {
      return this.endVideo(this.cur_x, this.cur_y);
    };

    return Node;

  })();

  $(document).ready(function() {
    debugReport('Document now ready.');
    return $.ajax({
      type: 'GET',
      dataType: 'json',
      url: 'http://localhost/videos.json',
      data: '',
      success: function(data, stat, jqxhr) {
        var a, b, videoNode;
        debugReport('Ajax successful!');
        a = 0;
        b = 0;
        videoNode = new Node(data);
        videoNode.loadAll();
        videoNode.setActive(a, b);
        return $(document).keyup(function(e) {
          switch (e.which) {
            case 13:
              debugReport('Selected!');
              if (videoNode.getCurrentNode().isGroup()) {
                videoNode = videoNode.getCurrentNode();
                videoNode.loadAll();
                debugReport('Setting active!');
                a = 0;
                b = 0;
                return videoNode.setActive(a, b);
              } else {
                debugReport('Playing real video!');
                return videoNode.playCurrentVideo();
              }
              break;
            case 39:
              debugReport('Next video!');
              debugReport('Pausing...');
              videoNode.pauseCurrentVideo();
              a += 1;
              if (a >= 5) {
                a = 0;
                b += 1;
                if (b >= 5) {
                  if (videoNode.parent !== null) {
                    debugReport('Parent not null');
                    a = videoNode.getParentPosition()[0];
                    b = videoNode.getParentPosition()[1];
                    videoNode = videoNode.parent;
                    debugReport('Load all from parent');
                    videoNode.loadAll();
                    debugReport('Finished loading');
                  } else {
                    a = 0;
                    b = 0;
                  }
                }
              }
              debugReport('Setting active...');
              return videoNode.setActive(a, b);
          }
        });
      },
      error: function(jqxhr, status, error) {
        return debugReport('Error: ' + status);
      }
    });
  });

}).call(this);
