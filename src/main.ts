import { traverseFile } from './utils'
const fs = require('fs')
const Grid = require("console-grid");
const cwd = process.cwd() + '/'

interface AnalysisItem {
    [key: string]: {
        count: number
        elements: string[]
    }
}

function cutPath(str: string) {
    return str.replace(cwd.substr(0, cwd.length-1), '') 
}

const findComponents = (path: string, res: AnalysisItem)=> {
    const readFileSyncRes = fs.readFileSync(path , 'utf8')
    const matchRes: string[] = readFileSyncRes.match(/\<[A-Z]\w+/g)
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

const analysis  = ()=> {

    const grid = new Grid();
    const res: AnalysisItem = {}
    traverseFile(cwd.substr(0, cwd.length-1), path=> findComponents(path, res))
    var data = {
        option: {
            sortField: "count"
        },
        columns: [{
            id: "name",
            name: "ComponentName",
            type: "string",
            maxWidth: 38
        }, {
            id: "count",
            name: "Count",
            type: "string",
            maxWidth: 7
        },{
            id: "paths",
            name: "Paths",
            type: "string",
            maxWidth: 200
        }],
        rows: Object.entries(res).reduce((pre, [el, value])=>{
            pre.push({
                name: `\x1b[40m \x1b[31m ${el} \x1b[0m`,
                count: value.count,
                paths: value.elements.join('\n')
            })
            return pre
        }, [])
    };
    grid.render(data);
}

export { analysis }