import Canvax from "canvax"

const _ = Canvax._;

export default class coorBase extends Canvax.Event.EventDispatcher
{
	constructor(opts, root){
        super(opts, root);

        this._opts = opts;
        this.root  = root;
        this.dataFrame = this.root.dataFrame;

        //这个width为坐标系的width，height， 不是 图表的width和height（图表的widht，height有padding等）
        this.width  = 0;
        this.height = 0;
        this.origin = {
            x : 0,
            y : 0
        };

        this.sprite = null;
        
        /*
        吧原始的field转换为对应结构的显示树
        ["uv"] --> [
            {field:'uv',enabled:true ,yAxis: yAxisleft }
            ...
        ]
        */
        this.fieldsMap = null;
        this.induce = null;
    }

    //设置 fieldsMap 中对应field 的 enabled状态
    setFieldEnabled( field )
    {
        var me = this;
        function set( maps ){
            _.each( maps , function( map , i ){
                if( _.isArray( map ) ){
                    set( map )
                } else if( map.field && map.field == field ) {
                    map.enabled = !map.enabled;
                }
            } );
        }
        set( me.fieldsMap );
    }

    getFieldMapOf( field )
    {
        var me = this;
        var fieldMap = null;
        function get( maps ){
            _.each( maps , function( map , i ){
                if( _.isArray( map ) ){
                    get( map )
                } else if( map.field && map.field == field ) {
                    fieldMap = map;
                    return false;
                }
            } );
        }
        get( me.fieldsMap );
        return fieldMap;
    }

    //如果有传参数 fields 进来，那么就把这个指定的 fields 过滤掉 enabled==false的field
    //只留下enabled的field 结构
    filterEnabledFields( fields ){
        var me = this;
        var arr = [];
        if( !_.isArray( fields ) ) fields = [ fields ];
        _.each( fields, function( f ){
            if( !_.isArray( f ) ){
                if( me.getFieldMapOf(f).enabled ){
                    arr.push( f );
                }
            } else {
                //如果这个是个纵向数据，说明就是堆叠配置
                var varr = [];
                _.each( f, function( v_f ){
                    if( me.getFieldMapOf( v_f ).enabled ){
                        varr.push( v_f );
                    }
                } );
                if( varr.length ){
                    arr.push( varr )
                }
            }
        } );
        return arr;
    }

    removeField( field )
    {
        this.changeFieldEnabled( field );
    }

    addField( field )
    {
        this.changeFieldEnabled( field );
    }
}