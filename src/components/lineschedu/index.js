import Component from "../component"
import Canvax from "canvax"
import { _, getDefaultProps } from "mmvis"

export default class lineSchedu extends Component
{
    static defaultProps = {
        lineField : {
            detail : '对应的line字段',
            default: null
        },
        style : {
            detail: '默认色',
            default: '#3995ff'
        },
        fillStyle : {
            detail: '节点填充色',
            default: "#ffffff"
        },
        lineWidth : {
            detail : '线宽',
            default: 2
        },
        radius : {
            detail : '圆点半径',
            default: 6
        },
        timeFontSize : {
            detail: '时间文本大小',
            default: 14
        },
        timeFontColor: {
            detail : '时间文本颜色',
            default: '#606060'
        },
        listFontSize: {
            detail : '列表信息文本大小',
            default: 12
        }
    }

    constructor( opt, app )
    {
        super(opt, app);
        this.name = "lineSchedu";

        _.extend(true, this , getDefaultProps(lineSchedu.defaultProps), opt );

        this.lineDatas = null;
        this.sprite = new Canvax.Display.Sprite();
        this.app.graphsSprite.addChild( this.sprite );
    }

    reset( opt )
    {
        _.extend(true, this , opt );
        this.lineDatas = null;
        this.sprite.removeAllChildren();
        this.draw();
    }

    draw()
    {
        var me = this;
        
        var _coord = this.app.getComponent({name:'coord'});
        this.pos = {   
            x: _coord.origin.x,
            y: _coord.origin.y
        };
        this.setPosition();

        var lineGraphs = me.app.getComponent({
            name  : 'graphs',
            type  : "line",
            field : me.lineField
        });

        me.lineDatas = lineGraphs.data[ me.lineField ].data;

        var iNode = this.app.getComponent({name : "coord"}).getAxis({type: "xAxis"}).getIndexOfVal( this.time );
        
        if( iNode == -1 ){
            return;
        };

        var nodeData = this.lineDatas[iNode];

        if( nodeData.y != undefined ){
            var y = me._getNodeY( nodeData, _coord );
            var x = nodeData.x;

            var _txtSp = new Canvax.Display.Sprite({
                context : {
                    x : x - 20
                }
            });
            this.sprite.addChild( _txtSp );
            var txtHeight = 0;

            var _title = new Canvax.Display.Text( me.time, {
                context : {
                    fillStyle : this.timeFontColor || this.style,
                    fontSize  : this.timeFontSize
                } 
            } );
            _txtSp.addChild( _title );
            var txtHeight = _title.getTextHeight();
            var txtWidth = _title.getTextWidth();

            var _list = new Canvax.Display.Text(_.flatten([me.list]).join("\n") , {
                context : {
                    y : txtHeight,
                    fillStyle : this.listFontColor || this.style,
                    fontSize  : this.listFontSize
                } 
            } );
            _txtSp.addChild( _list );
            txtHeight += _list.getTextHeight();
            txtWidth = Math.max( txtWidth, _list.getTextWidth() );

            if( txtWidth + x - 20 > _coord.width+me.app.padding.right){
                _txtSp.context.x = _coord.width+me.app.padding.right;
                _title.context.textAlign = "right";
                _list.context.textAlign = "right";
            };

            var tsTop = 0;
            if( me.status == "online" ){
                tsTop = y - (this.radius + 3) - txtHeight;
                if( Math.abs(tsTop) > _coord.origin.y ){
                    tsTop = -_coord.origin.y;
                    y = -(_coord.origin.y - (this.radius + 3) - txtHeight);
                };
            } else {
                tsTop = y + (this.radius + 3);
                if( tsTop + txtHeight > 0 ){
                    tsTop = -txtHeight;
                    y = - (this.radius + 3) - txtHeight
                };
            };
            
            _txtSp.context.y = tsTop;

            var _line = new Canvax.Shapes.BrokenLine({
                context : {
                    pointList: [
                        [ x, y ], [ x, nodeData.y ]
                    ],
                    strokeStyle : me.style,
                    lineWidth : me.lineWidth
                }
            });

            me.sprite.addChild( _line );

            var _node = new Canvax.Shapes.Circle({
                context : {
                    x : x,
                    y : y,
                    r : me.radius,
                    fillStyle : me.fillStyle,
                    strokeStyle : me.style,
                    lineWidth : me.lineWidth
                }
            });
            me.sprite.addChild( _node );

        }

    }

    _getNodeY(nodeData, _coord){
    
        var appHeight = this.app.height;
        var coordHeight = _coord.height;
        var y = nodeData.y;
        if( this.status == "online" ){
            y -= Math.min( 50, (appHeight-Math.abs( y ))*0.3 )
        } else {
            y += Math.min( 50, Math.abs( y )*0.3 )
        };
        return y;
    }

}