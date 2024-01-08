import * as THREE from 'three';
import calculateGravity from './gravity.js';


class StandardOrbit
{
    constructor(scene, object, col)
    {
        this.scene = scene;
        this.object = object;
        this.gravityObjects = [];

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array( 10000 * 3 ); // 3 vertices per point
        geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

        this.positionAttribute = geometry.getAttribute( 'position' );

        geometry.setDrawRange( 0, 10000+1 );

        this.positionAttribute.needsUpdate = true; 
        const material = new THREE.LineDashedMaterial( {color: col, dashSize: 5, gapSize: 15} );

        this.line = new THREE.Line( geometry, material );
        this.scene.add( this.line );

    }

    addPulledBy(obj) //dodawnaie obiektów które wpływaja na dany obiekt
    {
        this.gravityObjects.push(obj);
    }


    setLineLength(lineLength) //nieuzywane
    {
        this.lineLength = this.lineLength;
    }

    updateOrbit(stepTime) // rysowanie orbity poprzez symulowanie iluśtam kroków naprzód
    {

        let simulatedObject = 
        {
            position: this.object.position.clone(),
            velocity: this.object.velocity.clone(),
            mass: this.object.mass
        };

        this.positionAttribute.setXYZ(0, this.object.position.x, this.object.position.y, this.object.position.z);            


        let highestPosition = 0;
        let minPosition = -1;

        for(let d = 0; d < 10000; d++)
        {
            let resultAccel = new THREE.Vector3(0, 0, 0);

            for(let i = 0; i < this.gravityObjects.length; i++)
            {
                resultAccel.add(calculateGravity(this.gravityObjects[i], simulatedObject));
                if(simulatedObject.position.distanceTo(this.gravityObjects[i].position) < 10)
                {
                    this.line.geometry.setDrawRange( 0, d+1 );
                    break;
                }
            }

            simulatedObject.velocity.add(resultAccel.multiplyScalar(stepTime));

            simulatedObject.position.add(simulatedObject.velocity.clone().multiplyScalar(-1 * stepTime));

            this.positionAttribute.setXYZ(d+1, simulatedObject.position.x, simulatedObject.position.y, simulatedObject.position.z);
            
            const currentDistance = this.object.position.distanceTo(simulatedObject.position);

            if(currentDistance > highestPosition) //tu się sprawdza czy można skończyć orbite rysować jeśli np juz zatoczyła koło albo coś się zesrało
                highestPosition = currentDistance
            else //will be run after passing most far point of the orbit
            {
                if(minPosition == -1)
                    minPosition = currentDistance;
                else if(currentDistance < minPosition)
                    minPosition = currentDistance;
                else
                {
                    this.line.geometry.setDrawRange( 0, d+1 );
                    break;
                }   

                if(currentDistance < 50)
                {
                    this.line.geometry.setDrawRange( 0, d+1 );
                    break;
                }
            }
        }
        this.line.computeLineDistances();
        this.line.geometry.attributes.position.needsUpdate = true; 
        this.line.geometry.computeBoundingBox();
        this.line.geometry.computeBoundingSphere();
        


    }
}

export default StandardOrbit;