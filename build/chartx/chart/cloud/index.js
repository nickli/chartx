﻿define(
    'chartx/chart/cloud/index', [
        'chartx/chart/index',
        'chartx/layout/cloud/index',
        "canvax/shape/Rect",
        'chartx/utils/dataformat',
        'chartx/components/tips/tip',
    ],
    function(Chart, Layout, Rect, dataFormat, Tip) {
        /*
         *@node chart在dom里的目标容器节点。
         */
        var Canvax = Chart.Canvax;

        return Chart.extend({
            // element : null,
            // opts    : null,
            init: function(node, data, opts) {
                // this.element = node;
                this.data = data;
                this.options = opts;

                this.layoutData = [] //当前展现的数组(根据dataZoom.start和dataZoom.end,从data中获取)

                this.layoutRange = {} //当前range

                this.dataZoom = {
                        enabled: false,
                        range: {
                            start: 0,
                            end: data.length - 1 //因为第一行是title
                        }
                    },

                    this.padding.top = 10, this.padding.bottom = 5
                if (opts.dataZoom) {
                    this.dataZoom.enabled = true;
                    this.padding.bottom += 46;
                } else {
                    this.padding.top = this.padding.bottom = this.padding.left = this.padding.right = 0
                };

                this.fontFamily = "Impact";

                _.deepExtend(this, opts);
                this.dataFrame = this._initData(data, opts);
            },
            draw: function() {
                var me = this
                me.core = new Canvax.Display.Sprite({
                    id: 'core'
                });
                me.stageTip = new Canvax.Display.Sprite({
                    id: 'tip'
                });
                me.stage.addChild(me.core);
                me.stage.addChild(me.stageTip)
                me._graphs = new Canvax.Display.Sprite({
                    id: 'graphs',
                    context: {
                        x: me.width / 2,
                        y: (me.height - me.padding.bottom) / 2
                    }
                });
                me.core.addChild(me._graphs)

                if (me.dataZoom.enabled) {
                    me._initDataZoom()
                    var range = me.options.dataZoom.range
                    me.layoutData = me.dataFrame.yAxis.org[0].slice(range.start, range.end + 1)
                } else {
                    me.layoutData = me.dataFrame.yAxis.org[0]
                }

                me._drawGraphs();

                me._tip = new Tip(me.tips, me.canvax.getDomContainer());
                me.stageTip.addChild(me._tip.sprite);

                me.inited = true;
            },

            replayGraphs: function($o) {
                var me = this
                var start = $o.start,
                    end = $o.end

                if (start == me.layoutRange.start && end == me.layoutRange.end) {
                    return
                }

                me.layoutRange.start = start, me.layoutRange.end = end

                me.layoutData = me.dataFrame.yAxis.org[0].slice(start, end + 1)

                me._drawGraphs()
            },

            _initData: function(data, opts) {
                return dataFormat.apply(this, arguments);
            },

            _initDataZoom: function() {
                var me = this
                require(["chartx/components/datazoom/index"], function(DataZoom) {
                    var w = me.width - me.padding.left - me.padding.right
                    var x = me.padding.left
                    var options = _.deepExtend({
                        w: w,
                        h: 30,
                        count: data.length - 1,
                        pos: {
                            x: x,
                            y: me.height - me.padding.bottom
                        },
                        dragIng: function(o) {
                            me.dataZoom.range.start = ~~me._dataZoom.range.start, me.dataZoom.range.end = ~~me._dataZoom.range.end
                            me._updateRange(me.dataZoom.range)
                        },
                        dragEnd: function(o) {
                            // me.fire("datazoomRange", o);
                            // me._endRange(me._dataZoom.range)
                        }
                    }, me.dataZoom);
                    me._dataZoom = new DataZoom(options);
                    me.core.addChild(me._dataZoom.sprite);
                })
            },
            _updateRange: function($o) {
                this.replayGraphs($o)
            },

            _getInfoHandler: function(target) {
                var me = this
                return {
                    iGroup: target.index,
                    iNode: -1,
                    iLay: -1,
                    dataZoom: me.dataZoom,
                    data: me.dataFrame.getRowData(target.index + me.dataZoom.range.start),
                    nodesInfoList: [{
                        field: me.dataFrame.yAxis.field[0],
                        x: target.context.x,
                        y: target.context.y,
                        value: target.text,
                        fontSize: target.context.fontSize,
                        fillStyle: target.context.fillStyle
                    }]
                }
            },

            _getColor: function(c, para) {
                var s = '#ffffff'
                if (_.isString(c)) {
                    return c
                }
                if (_.isFunction(c)) {
                    return c(para);
                }
                return s
            },

            _drawGraphs: function() {
                var me = this;

                var layout = Layout()
                    .size([me.width - me.padding.left - me.padding.right, me.height - me.padding.bottom])
                    .words(me.layoutData.map(function(d) {
                        return {
                            text: d,
                            size: 12 + Math.random() * 50
                        };
                    }))
                    .padding(7)
                    .rotate(function() {
                        //return 0;
                        return (~~(Math.random() * 6) - 3) * 30;
                    })
                    .font(me.fontFamily)
                    .fontSize(function(d) {
                        return d.size;
                    })
                    .on("end", draw);

                layout.start();

                function draw( words , e ) {
                    var w = me.width;
                    var h = me.height;
                    // var scale = e ? Math.min(w / Math.abs(e[1].x - w / 2), w / Math.abs(e[0].x - w / 2), h / Math.abs(e[1].y - h / 2), h / Math.abs(e[0].y - h / 2)) / 2 : 1,

                    if (me._graphs) {
                        me._graphs.removeAllChildren()
                    };

                    _.each(words, function(tag, i) {
                        var tagTxt = new Canvax.Display.Text(tag.text, {
                            //xyToInt : true,
                            context: {
                                x: tag.x,
                                y: tag.y,
                                fontSize: tag.size,
                                fontFamily: tag.font,
                                rotation: tag.rotate,
                                textBaseline: "middle",
                                textAlign: "center",
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fillStyle: me._getColor((me.options.graphs && me.options.graphs.text && me.options.graphs.text.fillStyle) && me.options.graphs.text.fillStyle, {
                                    iGroup: tag.index,
                                    value: tag.text
                                })

                            }
                        });
                        tagTxt.index = tag.index
                        tagTxt.on('mouseover', function(e) {
                            e.eventInfo = me._getInfoHandler(e.target)
                            me._tip.show(e);
                        })
                        tagTxt.on('mousemove', function(e) {
                            e.eventInfo = me._getInfoHandler(e.target)
                            me._tip.move(e);
                        })
                        tagTxt.on('mouseout', function(e) {
                            me._tip.hide(e);
                        })
                        tagTxt.on('click', function(e) {
                            e.eventInfo = me._getInfoHandler(e.target)
                            me.fire(e.type, e);
                        });

                        me._graphs.addChild(tagTxt);

                    });

                }
            }
        });
    });