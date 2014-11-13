//
//  Grid3DOverlay.cpp
//  interface/src/ui/overlays
//
//  Created by Ryan Huffman on 11/06/14.
//  Copyright 2014 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

#include "Grid3DOverlay.h"

#include "Application.h"

ProgramObject Grid3DOverlay::_gridProgram;

Grid3DOverlay::Grid3DOverlay() : Base3DOverlay(),
    _minorGridWidth(1.0),
    _majorGridEvery(5) {
}

Grid3DOverlay::~Grid3DOverlay() {
}

void Grid3DOverlay::render(RenderArgs* args) {
    if (!_visible) {
        return; // do nothing if we're not visible
    }

    if (!_gridProgram.isLinked()) {
        if (!_gridProgram.addShaderFromSourceFile(QGLShader::Fragment, Application::resourcesPath() + "shaders/grid.frag")) {
            qDebug() << "Failed to compile: " + _gridProgram.log();
            return;
        }
        if (!_gridProgram.link()) {
            qDebug() << "Failed to link: " + _gridProgram.log();
            return;
        }
    }

    // Render code largely taken from MetavoxelEditor::render()
    glDisable(GL_LIGHTING);

    glDepthMask(GL_FALSE);

    glPushMatrix();

    glm::quat rotation = getRotation();

    glm::vec3 axis = glm::axis(rotation);

    glRotatef(glm::degrees(glm::angle(rotation)), axis.x, axis.y, axis.z);

    glLineWidth(1.5f);

    // center the grid around the camera position on the plane
    glm::vec3 rotated = glm::inverse(rotation) * Application::getInstance()->getCamera()->getPosition();
    float spacing = _minorGridWidth;

    float alpha = getAlpha();
    xColor color = getColor();
    glm::vec3 position = getPosition();

    const int GRID_DIVISIONS = 300;
    const float MAX_COLOR = 255.0f;
    float scale = GRID_DIVISIONS * spacing;

    glColor4f(color.red / MAX_COLOR, color.green / MAX_COLOR, color.blue / MAX_COLOR, alpha);

    _gridProgram.bind();

    // Minor grid
    glPushMatrix();
    {
        glTranslatef(_minorGridWidth * (floorf(rotated.x / spacing) - GRID_DIVISIONS / 2),
            spacing * (floorf(rotated.y / spacing) - GRID_DIVISIONS / 2), position.z);

        glScalef(scale, scale, scale);

        Application::getInstance()->getGeometryCache()->renderGrid(GRID_DIVISIONS, GRID_DIVISIONS);
    }
    glPopMatrix();

    // Major grid
    glPushMatrix();
    {
        glLineWidth(4.0f);
        spacing *= _majorGridEvery;
        glTranslatef(spacing * (floorf(rotated.x / spacing) - GRID_DIVISIONS / 2),
            spacing * (floorf(rotated.y / spacing) - GRID_DIVISIONS / 2), position.z);

        scale *= _majorGridEvery;
        glScalef(scale, scale, scale);

        Application::getInstance()->getGeometryCache()->renderGrid(GRID_DIVISIONS, GRID_DIVISIONS);
    }
    glPopMatrix();

    _gridProgram.release();

    glPopMatrix();

    glEnable(GL_LIGHTING);
    glDepthMask(GL_TRUE);
}

void Grid3DOverlay::setProperties(const QScriptValue& properties) {
    Base3DOverlay::setProperties(properties);

    if (properties.property("minorGridWidth").isValid()) {
        _minorGridWidth = properties.property("minorGridWidth").toVariant().toFloat();
    }

    if (properties.property("majorGridEvery").isValid()) {
        _majorGridEvery = properties.property("majorGridEvery").toVariant().toInt();
    }
}

Grid3DOverlay* Grid3DOverlay::createClone() {
    Grid3DOverlay* clone = new Grid3DOverlay();
    writeToClone(clone);
    return clone;
}

void Grid3DOverlay::writeToClone(Grid3DOverlay* clone) {
    Base3DOverlay::writeToClone(clone);
    clone->_minorGridWidth = _minorGridWidth;
    clone->_majorGridEvery = _majorGridEvery;
}
