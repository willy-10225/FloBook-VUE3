app.title = 'FloBook Monitor';

var workstations = ['112', '113', '114', '115', 'Star', 'Chris', 'Ray'];
var infos = ['Duty Licenses', 'Users', 'Disk', 'RAM', 'CPU'];

var cpu = [[4,0,90],[4,1,60],[4,2,30],[4,3,97],[4,4,63],[4,5,0],[4,6,46]]
var ram = [[3,0,30],[3,1,20],[3,2,10],[3,3,78],[3,4,39],[3,5,0],[3,6,22]]
var disk = [[2,0,15],[2,1,10],[2,2,5],[2,3,65],[2,4,90],[2,5,0], [2,6,39]]
var users = [[1,0,6],[1,1,4],[1,2,2],[1,3,8],[1,4,1],[1,5,0],[1,6,1]]
var dutyLicenses = [[0,0,10],[0,1,7],[0,2,5],[0,3,3],[0,4,1],[0,5,0],[0,6,0]]

const dataMapping = arrData => arrData.map(item=>[item[1], item[0], item[2] || '-'])

cpu = dataMapping(cpu)
ram = dataMapping(ram)
disk = dataMapping(disk)
users = dataMapping(users)
dutyLicenses = dataMapping(dutyLicenses)

option = {
    tooltip: {
        position: 'top'
    },
    animation: false,
    grid: {
        height: '50%',
        y: '20%'
    },
    xAxis: {
        type: 'category',
        data: workstations,
        splitArea: {
            show: true
        }
    },
    yAxis: {
        type: 'category',
        data: infos,
        splitArea: {
            show: true
        }
    },
    visualMap: {
        type:'piecewise',
        pieces: [
            {gt: 70, lte: 100}, 
            {gt: 30, lte: 70},  
            {gt: 0, lte: 30}
        ],
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '15%',
        inRange:{
            color:['#4ABD71', '#FFD564', '#F15E75']
        },
        controller:{
            inRange:{
                color:['#4ABD71', '#F4E067', '#F15E75'],
            }
        }
    },
    series: [{
        name: 'CPU',
        type: 'heatmap',
        data: cpu,
        label: {
            normal: {
                show: true
            }
        },
        itemStyle: {
            normal:{
                label:{
                    show:true,
                    formatter: "{@[2]}%",
                    textStyle:{
                        color:'#333',
                        fontWeight: 'bold'
                    }
                }
            },
            emphasis: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
        }
    },
    {
        name: 'RAM',
        type: 'heatmap',
        data: ram,
        label: {
            normal: {
                show: true
            }
        },
        itemStyle: {
            normal:{
                label:{
                    show:true,
                    formatter: "{@[2]}%",
                    textStyle:{
                        color:'#333',
                        fontWeight: 'bold'
                    }
                }
            },
            emphasis: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
        }
    },
    {
        name: 'Disk',
        type: 'heatmap',
        data: disk,
        label: {
            normal: {
                show: true
            }
        },
        itemStyle: {
            normal:{
                label:{
                    show:true,
                    formatter: "{@[2]}%",
                    textStyle:{
                        color:'#333',
                        fontWeight: 'bold'
                    }
                }
            },
            emphasis: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
        }
    },
    {
        name: 'Users',
        type: 'heatmap',
        data: users,
        label: {
            normal: {
                show: true
            }
        },
        itemStyle: {
            normal:{
                label:{
                    textStyle:{
                        color:'#333',
                        fontWeight: 'bold'
                    }
                }
            },
            emphasis: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
        }
    },
    {
        name: 'Duty Licenses',
        type: 'heatmap',
        data: dutyLicenses,
        label: {
            normal: {
                show: true
            }
        },
        itemStyle: {
            normal:{
                label:{
                    textStyle:{
                        color:'#333',
                        fontWeight: 'bold'
                    }
                }
            },
            emphasis: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
        }
    }]
};