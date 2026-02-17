/**
 * Camera ring layout configuration
 *
 * position: Camera position in the ring layout
 *   - 'top'    top row
 *   - 'right'  right column
 *   - 'bottom' bottom row
 *   - 'left'   left column
 *
 * offset: Percentage position from the starting point of each edge (0-100)
 *   - top/bottom: 0 = leftmost, 100 = rightmost
 *   - left/right: 0 = topmost, 100 = bottommost
 */

export interface CameraPosition {
  cameraId: number;
  position: 'top' | 'right' | 'bottom' | 'left';
  offset: number; // 0-100, percentage from starting point
}

const cameraLayout: CameraPosition[] = [
  // Top row (left to right)
  { cameraId: 7,  position: 'top',    offset: 15 },
  { cameraId: 6,  position: 'top',    offset: 35 },
  { cameraId: 5,  position: 'top',    offset: 60 },
  { cameraId: 4,  position: 'top',    offset: 65 },
  { cameraId: 3,  position: 'top',    offset: 80 },
  { cameraId: 2,  position: 'top',    offset: 95 },
  { cameraId: 1,  position: 'top',    offset: 100 },

  // Right column (top to bottom)
  { cameraId: 17,  position: 'right',  offset: 100 },
  { cameraId: 18,  position: 'right',  offset: 95 },
  { cameraId: 19,  position: 'right',  offset: 40 },

  // Bottom row (left to right)
  { cameraId: 10, position: 'bottom', offset: 0 },
  { cameraId: 11, position: 'bottom', offset: 5 },
  { cameraId: 12, position: 'bottom', offset: 20 },
  { cameraId: 13, position: 'bottom', offset: 35 },
  { cameraId: 14, position: 'bottom', offset: 52 },
  { cameraId: 15, position: 'bottom', offset: 55 },
  { cameraId: 16, position: 'bottom', offset: 75 },

  // Left column (top to bottom)
  { cameraId: 9, position: 'left',   offset: 45 },
  { cameraId: 8, position: 'left',   offset: 55 },
];

export default cameraLayout;
