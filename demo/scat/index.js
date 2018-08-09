
KISSY.ready(function(){

    var S = KISSY;
    var data1= [
        ["val1","val2","val3","val4"],
        [ 26 , 101  , 201 , 151 ] ,
        [ 77  , 0 , 145 , 90 ] ,
        [ 84 , 488  , 88  , 200 ] ,
        [ 134  , 290  ,346 , 350 ] ,
        [ 325 , 90  , 188  , 400 ] ,
        [ 61  , 300  , 546 , 280 ] ,
        [ 17 , 201  , 101 , 500 ] ,
        [ 228  , 145 , 145 , 100 ] ,
        [ 199 , 388  , 288  , 530 ] ,
        [ 100  , 390  , 225 , 330 ]

    ];
    var options = {
 
        disYAndO : 20,
        mode  : 1,                                  //模式( 1 = 正常(y轴在背景左侧) | 2 = 叠加(y轴叠加在背景上))[默认：1]
        yAxis : {
            field   : ["val4","val3"],
            dataMode : 0,
            line:{
                enabled : 0,
                // strokeStyle : '#ff0000'
            },
            text:{
                fillStyle:'#999999',
                fontSize  : 12
            }
        },
        xAxis : {
            field : ["val2" , "val1"],
            disY: 6,
            dis : 6,
            line:{
                width   : 2,
                height  : 4,
                strokeStyle   : '#cccccc'
            },
            text:{
                fontSize  : 10
            }
        },
        graphs:{
            line:{
                strokeStyle : {
                    normals : ['#f8ab5e','#E55C5C'],
                },
                alpha       : {
                    normals : [0.8, 0.7],
                }
            }
        },       
        tips  :{
            tip  : {
                back:{
                    // disX:10
                }
            },
            line : {
                // lineType: ''
            },
            nodes:{

            }
        }
    }
    Chartx.create.scat("canvasTest" , data1 , options).then(function( chart ){
        chart.draw();
    })
    
});
