#data format
#[{video: whatever}, {group: []}]

typeIsArray = (value) ->
    value and
        typeof value is 'object' and
        value instanceof Array and
        typeof value.length is 'number' and
        typeof value.splice is 'function' and
        not (value.propertyIsEnumerable 'length')

status = ""

debugReport = (string) ->
    status += string + "<br>"
    $('#status').html(status)

sizeOfArray = 5

class Node
    constructor: () ->
        switch arguments.length
            when 5
                @video = arguments[0]
                @nodes = arguments[1]
                @is_group = arguments[2]
                @parent = arguments[3]
                @parent_position = arguments[4]
                @title = arguments[5]
                return
            when 1 #data
                debugReport("Processing main data")
                data = arguments[0]
                @video = null
                @nodes = (new Node(data[vg], this, vg) for vg in [0...data.length])
                debugReport("Data length invalid") if data.length != 25
                debugReport("Processed #{@nodes.length} nodes")
                @is_group = true
                @parent = null
                @parent_position = -1
                @cur_x = 0
                @cur_y = 0
                return
            when 3
                data = arguments[0]
                if 'video' of data
                    debugReport("Processing video #{data.video}")
                    @video = data.video
                    @nodes = null
                    @is_group = false
                    @parent = arguments[1]
                    @parent_position = arguments[2]
                    @title = null
                else if 'group' of data
                    @video = null
                    @nodes = (new Node(data.group[vg], this, vg) for vg in [0...data.group.length])
                    debugReport("Group length invalid") if data.group.length != 25
                    @title = data.title
                    @is_group = true
                    @parent = arguments[1]
                    @parent_position = arguments[2]
                    @cur_x = 0
                    @cur_y = 0
                return
    getParentPosition: ->
        [Math.floor(@parent_position / 5), @parent_position % 5]
    getNode: (a, b) ->
        @nodes[a * 5 + b]
    getCurrentNode: ->
        this.getNode(@cur_x, @cur_y)
    isGroup: ->
        @is_group
    videoUrl: ->
        "http://www.youtube.com/v/#{@video}?version=3&enablejsapi=1&playerapiid=ytplayer"
    coords: (x, y) ->
        "player_#{x}_#{y}"
    currentCoords: ->
        this.coords(@cur_x, @cur_y)
    jqueryId: (x, y) ->
        "#" + this.coords(x, y)
    currentJqueryId: ->
        this.jqueryId(@cur_x, @cur_y)
    loadIntoGrid: (x, y) ->
        debugReport("Loading into grid: #{x}, #{y}")
        if this.getNode(x, y).isGroup()
            $("#div_apiplayer_#{x}_#{y}").html(this.getNode(x, y).title)
        else
            $("#div_apiplayer_#{x}_#{y}").html("<div id=\"player_#{x}_#{y}\"></div>")
            params = { allowScriptAccess: 'always' }
            atts = { id: this.coords(x, y) }
            swfobject.embedSWF(this.getNode(x, y).videoUrl(), "player_#{x}_#{y}", "200", "200", "8", null, null, params, atts)
    loadAll: ->
        debugReport("Loading all")
        debugReport("Parent is #{@parent == null}")
        for c in [0...sizeOfArray]
            for d in [0...sizeOfArray]
                this.loadIntoGrid(c, d)
    setActive: (x, y) ->
        debugReport("#{x}, #{y} active")
        @cur_x = x
        @cur_y = y
        for c in [0...sizeOfArray]
            for d in [0...sizeOfArray]
                $("#apiplayer_#{c}_#{d}").css('background-color', 'white')
        $("#apiplayer_#{x}_#{y}").css('background-color', 'red')
    playVideo: (x, y) ->
        $(this.jqueryId(x, y))[0].playVideo()
    playCurrentVideo: ->
        this.playVideo(@cur_x, @cur_y)
    pauseVideo: (x, y) ->
        $(this.jqueryId(x, y))[0].pauseVideo()
    pauseCurrentVideo: ->
        debugReport("#{@cur_x}, #{@cur_y} pausing")
        try
            this.pauseVideo(@cur_x, @cur_y)
        catch error
            debugReport(error)
    endVideo: (x, y) ->
        this.pauseVideo(x, y)
        $(this.jqueryId(x, y))[0].seekTo(0, true)
    endCurrentVideo: ->
        this.endVideo(@cur_x, @cur_y)

$(document).ready ->
    debugReport('Document now ready.')
    $.ajax(
        type: 'GET',
        dataType: 'json',
        url: 'http://localhost/videos.json',
        data: '',
        success: (data, stat, jqxhr) ->
            debugReport('Ajax successful!')
            a = 0
            b = 0
            videoNode = new Node(data)
            videoNode.loadAll()
            videoNode.setActive(a, b)
            $(document).keyup (e) ->
                switch e.which
                    when 13
                        debugReport('Selected!')
                        if videoNode.getCurrentNode().isGroup()
                            videoNode = videoNode.getCurrentNode()
                            videoNode.loadAll()
                            debugReport('Setting active!')
                            a = 0
                            b = 0
                            videoNode.setActive(a, b)
                        else
                            debugReport('Playing real video!')
                            videoNode.playCurrentVideo()
                    when 39
                        debugReport('Next video!')
                        debugReport('Pausing...')
                        videoNode.pauseCurrentVideo()
                        a += 1
                        if a >= 5
                            a = 0
                            b += 1
                            if b >= 5
                                if videoNode.parent != null
                                    debugReport('Parent not null')
                                    a = videoNode.getParentPosition()[0]
                                    b = videoNode.getParentPosition()[1]
                                    videoNode = videoNode.parent
                                    debugReport('Load all from parent')
                                    videoNode.loadAll()
                                    debugReport('Finished loading')
                                else
                                    a = 0
                                    b = 0
                        debugReport('Setting active...')
                        videoNode.setActive(a, b)
        error: (jqxhr, status, error) ->
            debugReport('Error: ' + status)
    )
