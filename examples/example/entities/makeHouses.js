//
// makeHouses.js
//
//
// Created by Stojce Slavkovski on March 14, 2015
// Copyright 2015 High Fidelity, Inc.
//
// This sample script that creates house entities based on parameters.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function () {

    /** options **/
    var numHouses = 100;
    var xRange = 300;
    var yRange = 300;

    var sizeOfTheHouse = {
        x: 10,
        y: 10,
        z: 10
    };
    /**/

    // 
    // var modelUrl = "http://localhost/~stojce/models/3-Buildings-2-SanFranciscoHouse-";
    // var modelurlExt = ".fbx";
    // var modelVariations = 100;
    
    var houseModels = [
        "http://public.highfidelity.io/models/entities/3-Buildings-2-SanFranciscoHouseBlue.fbx",
        "http://public.highfidelity.io/models/entities/3-Buildings-2-SanFranciscoHouseBlue3.fbx",
        "http://public.highfidelity.io/models/entities/3-Buildings-2-SanFranciscoHouseGreen.fbx",
        "http://public.highfidelity.io/models/entities/3-Buildings-2-SanFranciscoHouseGreen2.fbx",
        "http://public.highfidelity.io/models/entities/3-Buildings-2-SanFranciscoHouseRed.fbx",
        "http://public.highfidelity.io/models/entities/3-Buildings-2-SanFranciscoHouseRose.fbx",
        "http://public.highfidelity.io/models/entities/3-Buildings-2-SanFranciscoHouseViolet.fbx",
        "http://public.highfidelity.io/models/entities/3-Buildings-2-SanFranciscoHouseYellow.fbx",
        "http://public.highfidelity.io/models/entities/3-Buildings-2-SanFranciscoHouseYellow2.fbx"
    ];
        
    var houses = [];

    function addHouseAt(position, rotation) {
        // get random house model
        //var modelNumber = 1 + Math.floor(Math.random() * (modelVariations - 1));
        //var modelUrl = modelUrl + modelNumber + modelurlExt;
        //print("Model ID:" + modelNumber);
        var modelUrl = houseModels[Math.floor(Math.random() * houseModels.length)];
        
        var properties = {
            type: "Model",
            position: position,
            rotation: rotation,
            dimensions: sizeOfTheHouse,
            modelURL: modelUrl
        };

        return Entities.addEntity(properties);
    }

    // calculate initial position
    var posX = MyAvatar.position.x - (xRange / 2);
    var measures = calculateParcels(numHouses, xRange, yRange);
    var dd = 0;

    // avatar facing rotation
    var rotEven = Quat.fromPitchYawRollDegrees(0, 270.0 + MyAvatar.bodyYaw, 0.0);

    // avatar opposite rotation
    var rotOdd = Quat.fromPitchYawRollDegrees(0, 90.0 + MyAvatar.bodyYaw, 0.0);
    var housePos = Vec3.sum(MyAvatar.position, Quat.getFront(Camera.getOrientation()));

    for (var j = 0; j < measures.rows; j++) {

        var posX1 = 0 - (xRange / 2);
        dd += measures.parcelLength;

        for (var i = 0; i < measures.cols; i++) {

            // skip reminder of houses
            if (houses.length > numHouses) {
                break;
            }

            var posShift = {
                x: posX1,
                y: 0,
                z: dd
            };

            print("House nr.:" + (houses.length + 1));
            houses.push(
                addHouseAt(Vec3.sum(housePos, posShift), (j % 2 == 0) ? rotEven : rotOdd)
            );
            posX1 += measures.parcelWidth;
        }
    }

    // calculate rows and columns in area, and dimension of single parcel
    function calculateParcels(items, areaWidth, areaLength) {

        var idealSize = Math.min(Math.sqrt(areaWidth * areaLength / items), areaWidth, areaLength);

        var baseWidth = Math.min(Math.floor(areaWidth / idealSize), items);
        var baseLength = Math.min(Math.floor(areaLength / idealSize), items);

        var sirRows = baseWidth;
        var sirCols = Math.ceil(items / sirRows);
        var sirW = areaWidth / sirRows;
        var sirL = areaLength / sirCols;

        var visCols = baseLength;
        var visRows = Math.ceil(items / visCols);
        var visW = areaWidth / visRows;
        var visL = areaLength / visCols;

        var rows = 0;
        var cols = 0;
        var parcelWidth = 0;
        var parcelLength = 0;

        if (Math.min(sirW, sirL) > Math.min(visW, visL)) {
            rows = sirRows;
            cols = sirCols;
            parcelWidth = sirW;
            parcelLength = sirL;
        } else {
            rows = visRows;
            cols = visCols;
            parcelWidth = visW;
            parcelLength = visL;
        }

        print("rows:" + rows);
        print("cols:" + cols);
        print("parcelWidth:" + parcelWidth);
        print("parcelLength:" + parcelLength);

        return {
            rows: rows,
            cols: cols,
            parcelWidth: parcelWidth,
            parcelLength: parcelLength
        };
    }

    function cleanup() {
        while (houses.length > 0) {
            if (!houses[0].isKnownID) {
                houses[0] = Entities.identifyEntity(houses[0]);
            }
            Entities.deleteEntity(houses.shift());
        }
    }

    Script.scriptEnding.connect(cleanup);
})();