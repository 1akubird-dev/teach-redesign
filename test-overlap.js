const studioBounds = {x: 10, y: 10, width: 100, height: 100};
const noteBounds = {x: 50, y: 50, width: 100, height: 100};

const isOverlapping = !(
  studioBounds.x + studioBounds.width <= noteBounds.x ||
  studioBounds.x >= noteBounds.x + noteBounds.width ||
  studioBounds.y + studioBounds.height <= noteBounds.y ||
  studioBounds.y >= noteBounds.y + noteBounds.height
);
console.log("Overlap (expected true):", isOverlapping);

const noteBounds2 = {x: 150, y: 150, width: 100, height: 100};
const isOverlapping2 = !(
  studioBounds.x + studioBounds.width <= noteBounds2.x ||
  studioBounds.x >= noteBounds2.x + noteBounds2.width ||
  studioBounds.y + studioBounds.height <= noteBounds2.y ||
  studioBounds.y >= noteBounds2.y + noteBounds2.height
);
console.log("Overlap2 (expected false):", isOverlapping2);
