import Pie from "./pie"
import GraphsBase from "../index"
import { global, _,getDefaultProps } from "mmvis"

class PieGraphs extends GraphsBase
{
    static defaultProps(){
        return {
            field: {
                detail: '字段配置',
                default: null
            },
            groupField: {
                detail: '分组字段',
                default: null,
                documentation: 'groupField主要是给legend用的， 所有在legend中需要显示的分组数据，都用groupField'
            },
            sort : {
                detail: '排序，默认不排序，可以配置为asc,desc',
                default: null
            },
            startAngle: {
                detail: '起始角度',
                default: -90
            },
            allAngle: {
                detail: '全部角度',
                default: 360
            },
            node: {
                detail: '单个节点（扇形）配置',
                propertys : {
                    radius: {
                        detail: '半径',
                        default: null,
                        documentation: '每个扇形单元的半径，也可以配置一个字段，就成了丁格尔玫瑰图'
                    },
                    innerRadius: {
                        detail: '内径',
                        default: 0
                    },
                    outRadius: {
                        detail: '外径',
                        default: null
                    },
                    minRadius: {
                        detail: '最小的半径厚度',
                        default: 10,
                        documentation: 'outRadius - innerRadius ， 也就是radius的最小值'
                    },
                    moveDis : {
                        detail: 'hover偏移量',
                        default: 15,
                        documentation: '要预留moveDis位置来hover sector 的时候外扩'
                    },
                    fillStyle: {
                        detail: '单个图形背景色',
                        default: null
                    },
                    focus: {
                        detail: '图形的hover设置',
                        propertys: {
                            enabled: {
                                detail: '是否开启',
                                default: true
                            }
                        }
                    },
                    select: {
                        detail: '图形的选中效果',
                        propertys: {
                            enabled: {
                                detail: '是否开启',
                                default: true
                            },
                            radius: {
                                detail: '选中效果图形的半径厚度',
                                default: 5
                            },
                            alpha: {
                                detail: '选中效果图形的透明度',
                                default: 0.7
                            }
                        }
                    }
                }
            },
            label: {
                detail: 'label',
                propertys: {
                    field: {
                        detail: '获取label的字段',
                        default: null
                    },
                    enabled: {
                        detail: '是否开启',
                        default: false
                    },
                    format: {
                        detail: 'label的格式化函数，支持html',
                        default: null
                    }
                }
            }
        }
    }

    constructor( opt, app )
    {
        super( opt, app );
        this.type = "pie";
        _.extend(true, this, getDefaultProps( PieGraphs.defaultProps() ), opt);

        this.init();
    }

    init()
    {
        //初步设置下data，主要legend等需要用到
        this.data = this._dataHandle();
    }

    _computerProps()
    {
        var w = this.width;
        var h = this.height;

        //根据配置情况重新修正 outRadius ，innerRadius ------------
        if( !this.node.outRadius ){
            var outRadius = Math.min(w, h) / 2;
            if ( this.label.enabled ) {
                //要预留moveDis位置来hover sector 的时候外扩
                outRadius -= this.node.moveDis;
            };
            this.node.outRadius = parseInt( outRadius );
        };
        if( this.node.radius !== null && _.isNumber( this.node.radius ) ){
            //如果用户有直接配置 radius，那么radius优先，用来计算
            this.node.radius = Math.max( this.node.radius, this.node.minRadius );
            //this.node.outRadius = this.node.innerRadius + this.node.radius;
            this.node.innerRadius = this.node.outRadius - this.node.radius;
        };
        
        //要保证sec具有一个最小的radius
        if( this.node.outRadius - this.node.innerRadius < this.node.minRadius ){
            this.node.innerRadius = this.node.outRadius - this.node.minRadius;
        };
        if( this.node.innerRadius < 0 ){
            this.node.innerRadius = 0;
        };
        // end --------------------------------------------------

    }

    /**
     * opt ==> {width,height,origin}
     */
    draw( opt )
    {
    
        !opt && (opt ={});

        _.extend(true, this, opt);
        this._computerProps();

        //这个时候就是真正的计算布局用得layoutdata了
        this._pie = new Pie( this , this._trimGraphs( this.data ) );
        this._pie.draw( opt );

        var me = this;
        if( this.animation && !opt.resize ){
            this._pie.grow( function(){
                me.fire("complete");
            } );
        } else {
            this.fire("complete");
        }
        
        this.sprite.addChild( this._pie.sprite );
    }

    show( label )
    {
        this._setEnabled( label, true );
    }

    hide( label )
    {
        this._setEnabled( label, false );
    }

    _setEnabled( label, status )
    {
        var me = this;

        _.each( this.data, function( item ){
            if( item.label === label ){
                item.enabled = status;
                return false;
            }
        } );
     
        me._pie.resetData( me._trimGraphs( me.data ) );
    }

    _dataHandle()
    {
        var me = this;
        //var _coord = me.app.getComponent({name:'coord'});

        var data = [];
        var dataFrame = me.dataFrame;
        
        for( var i=0,l=dataFrame.length; i<l; i++ ){
            var rowData = dataFrame.getRowDataAt(i);
            var color = me.app.getTheme( i );
            var layoutData = {
                rowData       : rowData,//把这一行数据给到layoutData引用起来
                focused       : false,  //是否获取焦点，外扩
                focusEnabled  : me.node.focus.enabled,

                selected      : false,  //是否选中
                selectEnabled : me.node.select.enabled,
                selectedR     : me.node.select.radius,
                selectedAlpha : me.node.select.alpha,
                enabled       : true,   //是否启用，显示在列表中
                
                fillStyle     : color,
                color         : color, //加个color属性是为了给tips用

                value         : rowData[ me.field ],
                label         : rowData[  me.groupField || me.label.field || me.field ],
                labelText     : null, //绘制的时候再设置,label format后的数据
                iNode         : i
            };

            if( _.isFunction( this.node.fillStyle ) ){
                var _color = this.node.fontColor( layoutData );
                if( !_color ){
                    layoutData.fillStyle = layoutData.color = _color;
                };
            };
            
            data.push( layoutData );
        };

        if( data.length && me.sort ){
            data.sort(function (a, b) {
                if (me.sort == 'asc') {
                    return a.value - b.value;
                } else {
                    return b.value - a.value;
                }
            });

            //重新设定下ind
            _.each( data, function( d, i ){
                d.iNode = i;
            } );
        };

        return data;
    }

    _trimGraphs( data ) 
    {
        var me = this;
        var total = 0;

        me.currentAngle = 0 + me.startAngle % 360;//me.allAngle;
        var limitAngle = me.allAngle + me.startAngle % me.allAngle;

        var percentFixedNum = 2;     
        
        //下面连个变量当node.r设置为数据字段的时候用
        var maxRval = 0;
        var minRval = 0;

        if ( data.length ) {
            //先计算出来value的总量
            for (var i = 0; i < data.length; i++) {
                //enabled为false的secData不参与计算
                if( !data[i].enabled ) continue;

                total += data[i].value;
                if( me.node.radius && (_.isString(me.node.radius) &&  me.node.radius in data[i].rowData) ){
                    var _r = Number(data[i].rowData[ me.node.radius ]);
                    maxRval = Math.max( maxRval, _r );
                    minRval = Math.min( minRval, _r );
                }
            };

            if ( total > 0 ) {
          
                for (var j = 0; j < data.length; j++) {
                    var percentage = data[j].value / total;

                    //enabled为false的sec，比率就设置为0
                    if( !data[j].enabled ){
                        percentage = 0;
                    };
                    
                    var fixedPercentage = +((percentage * 100).toFixed(percentFixedNum));

                    var angle = me.allAngle * percentage;
                    var endAngle = me.currentAngle + angle > limitAngle ? limitAngle : me.currentAngle + angle;
                    var cosV = Math.cos((me.currentAngle + angle / 2) / 180 * Math.PI);
                    var sinV = Math.sin((me.currentAngle + angle / 2) / 180 * Math.PI);
                    var midAngle = me.currentAngle + angle / 2;
                    cosV = cosV.toFixed(5);
                    sinV = sinV.toFixed(5);
                    var quadrant = function (ang) {
                        if (ang >= limitAngle) {
                            ang = limitAngle;
                        }
                        ang = ang % me.allAngle;
                        var angleRatio = parseInt(ang / 90);
                        if (ang >= 0) {
                            switch (angleRatio) {
                                case 0:
                                    return 1;
                                    break;
                                case 1:
                                    return 2;
                                    break;
                                case 2:
                                    return 3;
                                    break;
                                case 3:
                                case 4:
                                    return 4;
                                    break;
                            }
                        } else if (ang < 0) {
                            switch (angleRatio) {
                                case 0:
                                    return 4;
                                    break;
                                case -1:
                                    return 3;
                                    break;
                                case -2:
                                    return 2;
                                    break;
                                case -3:
                                case -4:
                                    return 1;
                                    break;
                            }
                        }
                    } (midAngle);

                    var outRadius = me.node.outRadius;
                    if( me.node.radius && (_.isString(me.node.radius) &&  me.node.radius in data[j].rowData) ){
                        var _rr = Number( data[j].rowData[me.node.radius] );                  
                        outRadius = parseInt( (me.node.outRadius - me.node.innerRadius) * ( (_rr - minRval)/(maxRval-minRval)  ) + me.node.innerRadius );
                    };

                    var moveDis = me.node.moveDis;

                    _.extend(data[j], {
                        outRadius   : outRadius,
                        innerRadius : me.node.innerRadius,
                        startAngle  : me.currentAngle, //起始角度
                        endAngle    : endAngle, //结束角度
                        midAngle    : midAngle,  //中间角度

                        moveDis     : moveDis,

                        outOffsetx  : moveDis * 0.7 * cosV, //focus的事实外扩后圆心的坐标x
                        outOffsety  : moveDis * 0.7 * sinV, //focus的事实外扩后圆心的坐标y

                        centerx     : outRadius * cosV,
                        centery     : outRadius * sinV,
                        outx        : (outRadius + moveDis) * cosV,
                        outy        : (outRadius + moveDis) * sinV,
                        edgex       : (outRadius + moveDis) * cosV,
                        edgey       : (outRadius + moveDis) * sinV,

                        orginPercentage: percentage,
                        percentage: fixedPercentage,
                    
                        quadrant: quadrant, //象限
                        labelDirection: quadrant == 1 || quadrant == 4 ? 1 : 0,
                        iNode: j
                    });

                    //这个时候可以计算下label，因为很多时候外部label如果是配置的
                    data[j].labelText = me._getLabelText( data[j] );
                    
                    me.currentAngle += angle;
                    
                    if (me.currentAngle > limitAngle) {
                        me.currentAngle = limitAngle;
                    }
                };
            }
        }

        return {
            list  : data,
            total : total
        };
    }

    _getLabelText( itemData )
    {
        var str;
        if( this.label.enabled ){
            if( this.label.format ){
                if( _.isFunction( this.label.format ) ){
                    str = this.label.format( itemData.label, itemData );
                }
            } else {
                var _field = this.label.field || this.groupField
                if( _field ){
                    str = itemData.rowData[ _field ] + "：" + itemData.percentage + "%" 
                } else {
                    str = itemData.percentage + "%" 
                }
            }
        }
        return str;
    }

    getList()
    {
        return this.data;
    }

    getLegendData()
    {
        //return this.data;
        var legendData = [];
        _.each( this.data, function(item){
            legendData.push( {
                name : item.label,
                color : item.fillStyle,
                enabled : item.enabled
            } )
        } );
        return legendData;
    }

    tipsPointerOf( e ){
    }

    tipsPointerHideOf( e ){
    }


    focusAt( ind ){
        var nodeData = this._pie.data.list[ ind ];

        if( !this.node.focus.enabled ) return;

        this._pie.focusOf( nodeData );
    }
    
    unfocusAt( ind ){
        var nodeData = this._pie.data.list[ ind ];
        if( !nodeData.node.focus.enabled ) return;
        this._pie.unfocusOf( nodeData );
    }
    
    selectAt( ind ){
        var nodeData = this._pie.data.list[ ind ];
        if( !this.node.select.enabled ) return;
        this._pie.selectOf( nodeData );
    }

    unselectAt( ind ){
        var nodeData = this._pie.data.list[ ind ];
        if( !this.node.select.enabled ) return;
        this._pie.unselectOf( nodeData );
    }
    
}

global.registerComponent( PieGraphs, 'graphs', 'pie' );

export default PieGraphs;