import React, { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Image } from "react-konva";
import useImage from "use-image";

import { Space } from "antd";
import mask from "../images2/mask-set-table.png";
import rotateLeftIcon from "../images2/rotate-left.svg";
import rotateRightIcon from "../images2/rotate-right.svg";
import Button from "../components/Button";
import Typography from "../components/Typography";
import { invertMask } from "../actions/images";
import KonvaImage from "./KonvaImage";

const USER_IMAGE_LAYER = {
  width: 544,
  height: 543,
  rotation: 0,
  imageLeft: 0,
  imageTop: 0
};

const MASK_LAYER = {
  width: 544,
  height: 543,
  left: 0,
  right: 0
};

/* eslint-disable react-hooks/exhaustive-deps */
const ImageEditor = ({ image }) => {
  const maskLayerRef = useRef(MASK_LAYER);
  const invertedMaskRef = useRef();
  const stageRef = useRef();

  const [imageMask] = useImage(mask, "Anonymous");

  const [values, setValues] = useState(() => ({
    ...USER_IMAGE_LAYER,
    rotation: 0
  }));

  //-----------------------------------------//
  //----------- min max zoom ----------------//
  //-----------------------------------------//
  const containerWidth = maskLayerRef.current
    ? maskLayerRef.current.width
    : USER_IMAGE_LAYER.width;
  const containerHeight = maskLayerRef.current
    ? maskLayerRef.current.height
    : USER_IMAGE_LAYER.height;

  const minZoom = image
    ? Math.max(
        containerWidth / image.naturalWidth,
        containerHeight / image.naturalHeight
      )
    : 1;

  useMemo(() => {
    if (image != null) {
      setValues({
        ...values,
        width: image.naturalWidth * minZoom,
        height: image.naturalHeight * minZoom
      });
    }
  }, [image]);

  /*
  !?!?
  useEffect(() => {
    maskLayerRef.current = MASK_LAYER;
  });*/
  // get the mask of the current selected userImage layer if there is any
  // useEffect(() => {
  //   if (!imageMask) return;
  //   maskLayerRef.current = imageMask;
  // }, [imageMask]);

  const complete = !!imageMask?.complete;
  useMemo(() => {
    if (!imageMask) return;
    if (complete) {
      invertedMaskRef.current = invertMask(imageMask);
    }
  }, [complete, imageMask]);

  if (!image) {
    return null;
  }

  // center and zoom the image by default

  const maxZoom = minZoom * 2;

  const onRotateLeft = () => {
    setValues({
      ...values,
      rotation: values.rotation - 10
    });
  };

  const onRotateRight = () => {
    setValues({
      ...values,
      rotation: values.rotation + 10
    });
  };

  const onDragEnd = (x, y) => {
    setValues({
      ...values,
      imageLeft: x,
      imageTop: y
    });
  };

  // zoom on wheel
  const handleWheel = (e) => {
    e.evt.preventDefault();
    if (e.evt.deltaY < 0) {
      onZoomPlus();
    } else {
      onZoomMinus();
    }
  };

  const getZoom = () => {
    return values.width / image.naturalWidth;
  };
  const setZoom = (zoom) => {
    //---- newSize ----//
    const newSize = {
      width: image.naturalWidth * zoom,
      height: image.naturalHeight * zoom
    };

    //---- newPosition ----//
    // The trick is that there's one pixel in the image
    // that doesn't move. It's the point at the center of the container.
    const fixPointInImage = {
      // relative to the image (not the container)
      x: containerWidth / 2 - values.imageLeft,
      y: containerHeight / 2 - values.imageTop
    };
    const pointRatio = {
      // the same for both sizes
      x: fixPointInImage.x / values.width,
      y: fixPointInImage.y / values.height
    };
    const newFixedPointInImage = {
      x: newSize.width * pointRatio.x,
      y: newSize.height * pointRatio.y
    };
    const newPosition = {
      imageLeft: containerWidth / 2 - newFixedPointInImage.x,
      imageTop: containerHeight / 2 - newFixedPointInImage.y
    };
    setValues({
      ...values,
      ...newSize,
      ...newPosition
    });
  };

  const onZoomMinus = () => {
    setZoom(Math.max(minZoom, getZoom() - 0.2));
  };

  const onZoomPlus = () => {
    setZoom(Math.min(maxZoom, getZoom() + 0.2));
  };

  return (
    <div className="flexCenter stretchSelf p-y-20">
      <div className="flexCenter">
        <Stage
          ref={stageRef}
          width={USER_IMAGE_LAYER.width}
          height={USER_IMAGE_LAYER.height}
          onWheel={handleWheel}
          x={0}
          y={0}
          style={maskLayerRef.current ? { backgroundColor: "#403B39" } : {}}
        >
          <Layer>
            {/* --------- user image ---------  */}
            <KonvaImage
              image={image}
              x={values.imageLeft}
              y={values.imageTop}
              onDragEnd={onDragEnd}
              rotation={values.rotation}
              container={maskLayerRef.current || USER_IMAGE_LAYER}
              width={values.width}
              height={values.height}
            />
            {/* --------- mask ---------  */}
            {maskLayerRef.current && (
              <Image
                image={invertedMaskRef.current}
                x={0}
                y={0}
                width={maskLayerRef.current.width}
                height={maskLayerRef.current.height}
                globalCompositeOperation="normal"
                opacity={0.7}
                listening={false} // equivalent to pointer events: none
                alt="mask"
              />
            )}
          </Layer>
        </Stage>
      </div>
      <div className="flexCenter stretchSelf m-t-20">
        <Space className="flexCenter" size={30}>
          <div className="flexColumn">
            <div className="m-b-5 stretchSelf flexCenter">
              <Typography>Zoom</Typography>
            </div>
            <Space>
              <Button onClick={onZoomMinus}>-</Button>
              <Button onClick={onZoomPlus}>+</Button>
            </Space>
          </div>
          {/* ------- rotation -------  */}
          <div className="flexColumn">
            <div className="m-b-10 m-t-20 stretchSelf flexCenter">
              <Typography>Rotation</Typography>
            </div>
            <Space size={40}>
              <button
                onClick={onRotateLeft}
                className="clickableText"
                type="button"
              >
                <img alt="rotate left" src={rotateLeftIcon} />
              </button>
              <button
                onClick={onRotateRight}
                className="clickableText"
                type="button"
              >
                <img alt="rotate right" src={rotateRightIcon} />
              </button>
            </Space>
          </div>
        </Space>
      </div>
    </div>
  );
};

export default ImageEditor;
