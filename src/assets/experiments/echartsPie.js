option = {
    title : {
        text: 'FloBook Monitor',
        subtext: '硬體監控',
        x:'center'
    },
    tooltip : {
        show: true,
        formatter: "{a} <br/>{b} : {c} ({d}%)",
        trigger: 'item',
    },
    legend: {
        x : 'center',
        y : 'bottom',
        data:['CPU','RAM','DISK']
    },
    toolbox: {
        show : true,
        feature : {
            mark : {show: true},
            dataView : {show: true, readOnly: false},
            magicType : {
                show: true,
                type: ['pie', 'funnel']
            },
            restore : {show: true},
            saveAsImage : {show: true}
        }
    },
    calculable : true,
    series : [
        {
            name:'半径模式',
            type:'pie',
            radius : [40, 110],
            center : ['15%', '20%'],
            roseType : 'radius',
            avoidLabelOverlap: false,
            itemStyle :　{
                normal : {
                    label : {
                        show : false,
                        formatter : "{d}%",
                        position: 'center'
                    },
                },
                emphasis : {
                    label: {
                        show : true,
                        position: 'center',
                        formatter : "{d}%",
                        textStyle : {
                            color : 'white',
                            fontSize : '20',
                            fontFamily : '微软雅黑',
                            fontWeight : 'bold'
                        }
                    }
                }
            },
            data:[
                {value:90, name:'CPU'},
                {value:30, name:'RAM'},
                {value:15, name:'DISK'},
            ]
        },
        {
            name:'半径模式',
            type:'pie',
            radius : [40, 110],
            center : ['50%', '20%'],
            roseType : 'radius',
            data:[
                {value:60, name:'CPU'},
                {value:20, name:'RAM'},
                {value:10, name:'DISK'},
            ]
        },
        {
            name:'半径模式',
            type:'pie',
            radius : [40, 110],
            center : ['85%', '20%'],

            data:[
                {value:30, name:'CPU'},
                {value:10, name:'RAM'},
                {value:5, name:'DISK'},
            ]
        },
        {
            name:'面积模式',
            type:'pie',
            radius : [40, 110],
            center : ['15%', '50%'],
            roseType : 'area',
            itemStyle :　{
                normal : {
                    label : {
                        show : true,
                        formatter : "{c}",
                        position: 'inside',
                        textStyle : {
                            color : 'white',
                            fontSize : '18',
                            fontFamily : '微软雅黑',
                            fontWeight : 'bold'
                        }
                    }
                },
                emphasis: {
                    label: {
                        show : true,
                        position: 'center',
                        formatter : "{c}",
                        textStyle : {
                            color : 'white',
                            fontSize : '20',
                            fontFamily : '微软雅黑',
                            fontWeight : 'bold'
                        }
                    }
                }
            },
            data:[
                {value:90, name:'CPU'},
                {value:30, name:'RAM'},
                {value:15, name:'DISK'},
            ]
        },
        {
            name:'112',
            type:'pie',
            radius : [40, 110],
            center : ['50%', '50%'],
            roseType : 'area',
            itemStyle :　{
                normal : {
                    label : {
                        show : true,
                        formatter : "{c}",
                        position: 'inside',
                        textStyle : {
                            color : 'white',
                            fontSize : '18',
                            fontFamily : '微软雅黑',
                            fontWeight : 'bold'
                        }
                    }
                },
                emphasis: {
                    label: {
                        show : true,
                        position: 'center',
                        formatter : "{c}",
                        textStyle : {
                            color : 'white',
                            fontSize : '20',
                            fontFamily : '微软雅黑',
                            fontWeight : 'bold'
                        }
                    }
                }
            },
            data:[
                {value:60, name:'CPU'},
                {value:20, name:'RAM'},
                {value:10, name:'DISK'},
            ]
        },
        {
            name:'113',
            type:'pie',
            radius : [40, 110],
            center : ['85%', '50%'],
            roseType : 'area',
            itemStyle :　{
                normal : {
                    label : {
                        show : true,
                        formatter : "{c}",
                        position: 'inside',
                        textStyle : {
                            color : 'white',
                            fontSize : '18',
                            fontFamily : '微软雅黑',
                            fontWeight : 'bold'
                        }
                    }
                },
                emphasis: {
                    label: {
                        show : true,
                        position: 'center',
                        formatter : "{c}",
                        textStyle : {
                            color : 'white',
                            fontSize : '20',
                            fontFamily : '微软雅黑',
                            fontWeight : 'bold'
                        }
                    }
                }
            },
            data:[
                {value:30, name:'CPU'},
                {value:10, name:'RAM'},
                {value:5, name:'DISK'},
            ]
        },
        {
            name:'114',
            type:'pie',
            radius : [40, 110],
            center : ['15%', '80%'],
            roseType : 'area',
            itemStyle :　{
                normal : {
                    label : {
                        show : true,
                        formatter : "{d}%",
                        position: 'inside',
                        textStyle : {
                            color : 'white',
                            fontSize : '18',
                            fontFamily : '微软雅黑',
                            fontWeight : 'bold'
                        }
                    },
                    labelLine:{
                        show: true
                    }
                },
                emphasis: {
                    label: {
                        show : true,
                        position: 'center',
                        formatter : "{d}%",
                        textStyle : {
                            color : 'white',
                            fontSize : '20',
                            fontFamily : '微软雅黑',
                            fontWeight : 'bold'
                        }
                    }
                }
            },
            data:[
                {value:90/100, name:'CPU'},
                {value:30/100, name:'RAM'},
                {value:15/100, name:'DISK'},
            ]
        },
        {
            name:'115',
            type:'pie',
            radius : [40, 110],
            center : ['50%', '80%'],
            roseType : 'area',
            data:[
                {value:60/100, name:'CPU'},
                {value:20/100, name:'RAM'},
                {value:10/100, name:'DISK'},
            ]
        },
        {
            name:'116',
            type:'pie',
            radius : [40, 110],
            center : ['85%', '80%'],
            roseType : 'area',
            data:[
                {value:30/100, name:'CPU'},
                {value:10/100, name:'RAM'},
                {value:5/100, name:'DISK'},
            ]
        }
    ]
};