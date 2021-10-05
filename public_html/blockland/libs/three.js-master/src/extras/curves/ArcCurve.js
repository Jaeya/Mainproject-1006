import { EllipseCurve } from './EllipseCurve.js';

/**************************************************************
 *	Arc curve
 **************************************************************/

function ArcCurve( aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise ) {

	EllipseCurve.call( this, aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise );

}

ArcCurve.prototype = Object.create( EllipseCurve.prototype );
ArcCurve.prototype.constructor = ArcCurve;


export { ArcCurve };
