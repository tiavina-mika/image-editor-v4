import { forwardRef } from "react";
import PropTypes from "prop-types";
import { Image, Group } from "react-konva";

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/display-name */
/* eslint-disable max-len */
const KonvaImage = forwardRef(
  (
    {
      x,
      y,
      width,
      height,
      image,
      rotation,
      // originTop = 0, originLeft = 0, // relative to the image top/left
      onDragEnd,
      container
    },
    ref
  ) => {
    // see https://konvajs.org/docs/posts/Position_vs_Offset.html
    // Offset change the origin of the shape
    // It changes the rotation origin, but also offsets the drawing of the shape.
    const offsetX = container.width / 2 - x; //container.width / 2 - x;
    const offsetY = container.height / 2 - y; //container.height / 2 - y;

    const usedOnDragEnd = (e) => {
      // We have to use a Group because offsetX and offsetY are buggy if x != 0
      // The moved image is the rotated one, so we have to invert the rotation.
      const movementX = e.target.x() - x;
      const movementY = e.target.y() - y;
      const rotationInRad = (rotation * Math.PI) / 180;
      const newX =
        x +
        movementX * Math.cos(rotationInRad) +
        movementY * Math.sin(rotationInRad);
      const newY =
        y -
        movementX * Math.sin(rotationInRad) +
        movementY * Math.cos(rotationInRad);
      onDragEnd(newX, newY);
    };

    const onMouseEnter = (event) => {
      event.target.getStage().container().style.cursor = "move";
    };
    const onMouseLeave = (event) => {
      event.target.getStage().container().style.cursor = "default";
    };

    return (
      <Group x={x} y={y} draggable onDragEnd={usedOnDragEnd}>
        <Image
          ref={ref}
          offsetX={offsetX}
          offsetY={offsetY}
          x={offsetX}
          y={offsetY}
          image={image}
          width={width}
          height={height}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          alt="user"
          rotation={rotation}
        />
      </Group>
    );
  }
);

KonvaImage.propTypes = {
  top: PropTypes.any,
  left: PropTypes.any,
  image: PropTypes.any,
  rotation: PropTypes.any,
  onDragEnd: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func
};

export default KonvaImage;
