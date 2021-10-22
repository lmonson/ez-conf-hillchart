import { deepEqual } from 'fast-equals';
import {initializeDataPoints} from "../src/DataPoints";

describe("some tests", () => {

    it.each`
        inputNames | previousState | newState
        ${['foo']}  | ${[]} | ${[{description:"foo",color:"black",size:10,x:0}]}
        ${['foo']}  | ${null} | ${[{description:"foo",color:"black",size:10,x:0}]}
        ${['foo']}  | ${[{description:"foo",color:"black",size:11,x:0}]} | ${[{description:"foo",color:"black",size:11,x:0}]}
        ${['foo']}  | ${[{description:"foo",color:"black",size:10,x:0, y:17.3}]} | ${[{description:"foo",color:"black",size:10,x:0}]}
        ${['bar']}  | ${[{description:"foo",color:"red",size:11,x:0, y:17.3}]} | ${[{description:"bar",color:"black",size:10,x:0}]}
        ${['bar','foo']}  | ${[{description:"foo",color:"red",size:11,x:0, y:17.3},{description:"bar",color:"black",size:12,x:0}]} | ${[{description:"foo",color:"red",size:11,x:0},{description:"bar",color:"black",size:12,x:0}]}
    `("Create result if null previous state", ({inputNames,previousState,newState})  => {
        let result =initializeDataPoints(inputNames, previousState);

        let equality = deepEqual( result, newState );
        expect(equality).toBe(true);
    });

});
