import { Edge, Node } from 'reactflow';
import { useState, useEffect } from 'react';

interface PropertyPanelProps {
  selectedNode: Node | null;
  setNodes: (updater: (nodes: Node[]) => Node[]) => void;
  setEdges: (updater: (edges: Edge[]) => Edge[]) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (source: string, target: string) => void;
}

const shapeStyles: Record<string, React.CSSProperties> = {
  rectangle: { borderRadius: '0%' },
  circle: { borderRadius: '50%' },
  ellipse: { borderRadius: '50% / 25%' },
  diamond: { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' },
  square: { borderRadius: '0%' },
  parallelogram: { transform: 'skew(20deg)' },
  rhombus: { transform: 'rotate(45deg)' },
  triangle: { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
};

const PropertyPanel = ({ selectedNode, setNodes, setEdges, deleteNode }: PropertyPanelProps) => {
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [shape, setShape] = useState('rectangle');
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [lineStyle, setLineStyle] = useState('solid');
  const [arrowStyle, setArrowStyle] = useState('default');
  const [comments, setComments] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label);
      setColor(selectedNode.style?.backgroundColor || '#ffffff');
      setShape(selectedNode.data?.shape || 'rectangle');
      setFontSize(parseInt(selectedNode.style?.fontSize || '14'));
      setFontFamily(selectedNode.style?.fontFamily || 'Arial');
    }
  }, [selectedNode]);

  const handleBackgroundColorChange = () => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode?.id) {
          return {
            ...node,
            style: {
              ...node.style,
              backgroundColor: color,
            },
            data: {
              ...node.data,
              backgroundColor: color, // Save the new color to data for persistence
            },
          };
        }
        return node;
      })
    );
  };

  const handleSave = () => {
    if (selectedNode) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === selectedNode.id
            ? {
                ...node,
                data: { ...node.data, label, shape },
                style: {
                  ...node.style,
                  backgroundColor: color,
                  ...shapeStyles[shape],
                  fontSize: `${fontSize}px`,
                  fontFamily,
                },
              }
            : node
        )
      );

      setEdges((edges) =>
        edges.map((edge) =>
          edge.source === selectedNode.id || edge.target === selectedNode.id
            ? {
                ...edge,
                style: {
                  ...edge.style,
                  stroke: color,
                  strokeDasharray: lineStyle === 'dashed' ? '4' : lineStyle === 'dotted' ? '2' : '0',
                  markerEnd: arrowStyle !== 'none' ? `url(#${arrowStyle})` : undefined,
                },
              }
            : edge
        )
      );

      // Update background color specifically
      handleBackgroundColorChange();
    }
  };

  const handleCommentChange = (nodeId: string, comment: string) => {
    setComments((prevComments) => ({
      ...prevComments,
      [nodeId]: comment,
    }));
  };

  const handleDeleteAllEdges = () => {
    if (selectedNode) {
      setEdges((edges) => edges.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    }
  };

  if (!selectedNode || selectedNode.data.label === 'Start' || selectedNode.data.label === 'End') {
    return <div>No editable properties for this node</div>;
  }

  return (
    <div className="p-2 border">
      <h5>Node Properties</h5>
      <div className="mb-2">
        <label>Label</label>
        <input
          type="text"
          className="form-control"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <label>Background Color</label>
        <input
          type="color"
          className="form-control"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <label>Shape</label>
        <select
          className="form-control"
          value={shape}
          onChange={(e) => setShape(e.target.value)}
        >
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="ellipse">Ellipse</option>
          <option value="diamond">Diamond</option>
          <option value="square">Square</option>
          <option value="parallelogram">Parallelogram</option>
          <option value="rhombus">Rhombus</option>
          <option value="triangle">Triangle</option>
        </select>
      </div>
      <div className="mb-2">
        <label>Font Size</label>
        <input
          type="number"
          className="form-control"
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
        />
      </div>
      <div className="mb-2">
        <label>Font Family</label>
        <select
          className="form-control"
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Courier">Courier</option>
        </select>
      </div>
      <div className="mb-2">
        <label>Line Style</label>
        <select
          className="form-control"
          value={lineStyle}
          onChange={(e) => setLineStyle(e.target.value)}
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
        </select>
      </div>
      <div className="mb-2">
        <label>Arrow Style</label>
        <select
          className="form-control"
          value={arrowStyle}
          onChange={(e) => setArrowStyle(e.target.value)}
        >
          <option value="default">Default</option>
          <option value="arrow">Arrow</option>
          <option value="diamond">Diamond</option>
          <option value="none">None</option>
        </select>
      </div>
      <div className="mb-2">
        <label>Comments</label>
        <textarea
          className="form-control"
          rows={3}
          value={comments[selectedNode.id] || ''}
          onChange={(e) => handleCommentChange(selectedNode.id, e.target.value)}
        />
      </div>
      <button onClick={handleSave} className="btn btn-success w-100">
        Save Changes
      </button>
      <button onClick={() => deleteNode(selectedNode.id)} className="btn btn-danger w-100 mt-2">
        Delete Node
      </button>
      <button onClick={handleDeleteAllEdges} className="btn btn-warning w-100 mt-2">
        Delete All Edges
      </button>
    </div>
  );
};

export default PropertyPanel;
