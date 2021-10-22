// var script = document.currentScript;
// noinspection JSUnusedGlobalSymbols

// // tslint:disable-next-line:no-submodule-imports
// import 'hill-chart/dist/styles.css';

// @ts-ignore
import HillChart from 'hill-chart';
import {ConfluenceAttachment, ConfluenceAttachmentFactory} from "./ConfluenceAttachment";
import {initializeDataPoints, updateDataPoint} from "./DataPoints";
import {debounce} from "throttle-debounce";



/**
 * Create a hill chart on a confluence page, employing a variety of heuristics along the say to make the process
 * as easy as possible.
 *
 * @param globallyUniqueChartName
 * @param datapoint_names
 * @param confluenceAttachment
 */
export async function hillChart(
    globallyUniqueChartName: string,
    datapoint_names: string[],
    confluenceAttachment?: ConfluenceAttachment
) {
    const svg = setupSvg(globallyUniqueChartName);

    const config = {
        target: svg,
        width: 700,
        height: 270,
        preview: false,
        backgroundColor: 'transparent', // Color to be used as bg, Use true for default color
    };

    const attachmentName = `${globallyUniqueChartName}.json`;

    let persistentAttachment = confluenceAttachment;
    if (!persistentAttachment) {
        const factory = new ConfluenceAttachmentFactory();
        persistentAttachment = factory.createFromCurrentPage(attachmentName);
        const existsOnCurrentPage = await persistentAttachment.attachmentExists();
        if ( !existsOnCurrentPage) {
            const thisSpaceAttachment = await factory.findInCurrentSpace(attachmentName);
            if ( thisSpaceAttachment && thisSpaceAttachment.length==1) {
                persistentAttachment = thisSpaceAttachment[0];
            }
        }
    }

    let previousState = [];
    if ( await persistentAttachment.attachmentExists() ) {
        previousState = await persistentAttachment.read();
    }

    let data = initializeDataPoints( datapoint_names, previousState);
    await persistentAttachment.upsert( data );

    const hill = new HillChart(data, config);
    hill.render();

    // hill.on('move', (x: any, y: any) => {
    //     console.log(`x: ${x}`);
    //     console.log(`y: ${y}`);
    // });


// Can also be used like this, because atBegin is false by default
    const debounceFunc = debounce(1000, (x:any) => {
        data = updateDataPoint( x, data );
        persistentAttachment?.update( data );
        console.log("moved", x);
    });

    hill.on('moved', debounceFunc );
    // (x: any) => {
    //     // If there's a timer, cancel it
    //     if (timeout) {
    //         window.cancelAnimationFrame(timeout);
    //     }
    //
    //     // Setup the new requestAnimationFrame()
    //     timeout = window.requestAnimationFrame(function () {
    //
    //     });
    //
    //
    //
    // });

    return hill;
}

/**
 * Add any missing elements to the page that are required in order to build and display a hill chart, including the
 * <svg> element for the chart, and return that <svg> element.
 *
 * These elements currently are:
 *
 *      A *single* reference to a stylesheet
 *      An <svg> element for display of the chart itself
 */
function setupSvg(globallyUniqueChartName:string) {
    // Add <link ...> stylesheet from known CDN for hill chart
    addStylesheetIfMissing();

    // Create svg element
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    // Insert svg at the proper place in the document
    insertSvg( svg, globallyUniqueChartName);

    return svg;
}

function insertSvg(svg:Element, globallyUniqueChartName:string) {
    const xpath = `//script[contains(text(),'${globallyUniqueChartName}')]`
    const scriptTag = document.evaluate( xpath, document).iterateNext();
    // @ts-ignore
    scriptTag.parentElement.insertBefore(svg, scriptTag);
}


function addStylesheetIfMissing() {

    // Is there already a stylesheet on the page?
    const xpath = "//link[contains(@href,'hill-chart') and @rel='stylesheet']";
    let result = document.evaluate(xpath, document);
    if ( result.iterateNext() )
        return

    // Add a stylesheet reference because there isn't one already
    const linkTag = document.createElement("link");
    linkTag.setAttribute("rel", "stylesheet");
    linkTag.setAttribute( "href", "https://unpkg.com/hill-chart@latest/dist/styles.css");
    document.head.append( linkTag );


}

// tslint:disable-next-line:interface-name
interface DataPoint {
    color: string;
    description: string;
    x: number;
}

// @ts-ignore
export class HillChartFactory {
    private data: DataPoint[];
    private target: string;

    constructor() {
        this.data = [];
        this.target = '';
    }

    public addDot(description: string, color = 'black') {
        const point: DataPoint = {
            color,
            description,
            x: 0,
        };
        this.data = this.data.concat(point);
        return this;
    }

    public setTarget(target: string) {
        this.target = target;
        return this;
    }

    public render() {
        const config = {
            preview: false,
            target: this.target,
        };
        const theChart = new HillChart(this.data, config);
        theChart.render();
        return theChart;
    }
}

//
// export function ConfluenceHillChart(data: any, config: any) {
//   const result = new HillChart(data, config);
//   let scripts = document.getElementsByTagName('script');
//   let script = scripts[scripts.length - 1];
//   console.log('\n\n SCRIPT\n\n', script);
//   return result;
// }
//
// export const data = [
//   {
//     id: '3', // (optional)
//     color: 'red',
//     description: 'Late af task',
//     size: 10,
//     x: 12.069770990416055,
//     y: 12.069770990416057,
//     link: '/fired.html',
//   },
//
//   {
//     id: '1', // (optional)
//     color: 'yellow',
//     description: 'Getting there',
//     size: 10,
//     x: 55.11627906976744,
//   },
//   {
//     id: '2', // (optional)
//     color: 'green',
//     description: 'Hell yeah!',
//     x: 93.48837209302326,
//     y: 6.511627906976724,
//     size: 10,
//   },
// ];
// export const config = {
//   target: '.hill-chart',
//   width: 700,
//   height: 270,
//   preview: false,
//   backgroundColor: 'white',
// };
