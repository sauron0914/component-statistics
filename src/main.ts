import { traverseFile } from './utils'
const fs = require('fs')
const exec = require('child_process').exec
const Grid = require("console-grid");
const cwd = process.cwd() + '/'


interface StatisticsItem {
    [key: string]: {
        count: number
        elements: string[]
    }
}

function cutPath(str: string) {
    return str.replace(cwd.substr(0, cwd.length-1), '') 
}

const findComponents = (path: string, res: StatisticsItem)=> {
    const readFileSyncRes = fs.readFileSync(path , 'utf8')
    const matchRes: string[] = readFileSyncRes.match(/(\<[A-Z]\w+)|(\<[a-z]\w+-\w+)/g)
    if(!matchRes) return
    matchRes.forEach(item => {
        const el = item.substr(1)
        if(Object.keys(res).includes(el)) {
            res[el].count++
            res[el].elements.push(cutPath(path))
        } else {
            res[el] = {
                count: 1,
                elements: [cutPath(path)]
            }
        }
    });
}

const createGird = (val)=> {
    const grid = new Grid();
    grid.render({
        option: {
            sortField: "count"
        },
        columns: [{
            id: "componentName",
            name: "componentName",
            type: "string",
            maxWidth: 38
        }, {
            id: "count",
            name: "Value",
            type: "string",
            maxWidth: 7
        }],
        rows: Object.entries(val).reduce((pre, [key, value])=> {
            pre.push({
                componentName: `\u001b[31m ${key} \u001b[39m`,
                count: (value as any).count
            })
            return pre
        },[])
    });
}

const statistics  = ()=> {
    const res: StatisticsItem = {}
    traverseFile(cwd.substr(0, cwd.length-1), path=> findComponents(path, res))

    const data = Object.entries(res).reduce((pre,[key, value])=>{
        pre.push({
            componentName: key,
            count: value.count,
            paths: value.elements
        })
        return pre
    },[]).sort((a, b)=> b.count-a.count).reduce((pre, item)=>{
        pre[item.componentName] = {
            count: item.count,
            paths: item.paths
        }
        return pre
    },{})


    fs.writeFile(cwd+'components-statistics.json', JSON.stringify(data, null, '\t'), {} ,function(err){
        if(err) console.log(err)
        console.log('文件创建成功，地址：' + cwd+'components-statistics.json');
        console.log('!!!注意：默认会在当前目录下生成一个components-statistics.json文件')
        createGird(data)
        exec( 'open ' + cwd+'components-statistics.json')
    })

    
}

export { statistics }