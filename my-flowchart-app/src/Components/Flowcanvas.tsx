import 'admin-lte/dist/css/adminlte.min.css';
import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  Node,
  OnConnect,
  Edge,
  Connection,
  EdgeProps,
  NodeProps,
} from 'react-flow-renderer';
import PropertyPanel from './Propertypanel';

/* ====================
   Custom Node Component
   ==================== */
const CustomNode = ({ data, id }: NodeProps) => {
  return (
    <div
      style={{
        position: 'relative',
        padding: 10,
        border: '1px solid #777',
        borderRadius: 4,
        background: data.backgroundColor || '#008000',
      }}
    >
      <div>{data.label}</div>
      <div
        style={{
          position: 'absolute',
          top: -25,
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 'pointer',
          background: '#fff',
          border: '1px solid #ccc',
          padding: '2px 5px',
          borderRadius: 3,
          fontSize: 10,
          display: data.showConfig ? 'block' : 'none',
        }}
        onClick={() => data.onConfigClick(id)}
      >
        Config
      </div>
    </div>
  );
};

/* ====================
   Custom Edge Component
   ==================== */
const CustomEdge = (props: EdgeProps) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
  } = props;

  const [edgePath] = addEdge(
    { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition } as unknown as Connection,
    []
  );

  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  return (
    <>
      <path id={id} style={style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />
      <foreignObject x={midX - 10} y={midY - 10} width={20} height={20}>
        <div
          style={{
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '50%',
            width: 20,
            height: 20,
            textAlign: 'center',
            lineHeight: '20px',
            cursor: 'pointer',
            fontSize: 12,
          }}
          onClick={() => data?.onDeleteEdge(id)}
        >
          X
        </div>
      </foreignObject>
    </>
  );
};

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    data: { label: 'Start', onConfigClick: () => {}, showConfig: false },
    position: { x: 250, y: 100 },
    style: { backgroundColor: 'rgb(102, 238, 102)' }, // Green for start node
  },
  {
    id: '2',
    type: 'custom',
    data: { label: 'End', onConfigClick: () => {}, showConfig: false },
    position: { x: 250, y: 400 },
    style: { backgroundColor: 'red' }, // Red for end node
  },
];

const initialEdges: Edge[] = [];

const FlowCanvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeId, setNodeId] = useState(3);

  const handleEdgeDelete = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    },
    [setEdges]
  );

  const onConnect: OnConnect = useCallback(
    (params) => {
      // Ensure that connections only happen between nodes that are not 'Start' or 'End'
      const validSource = params.source !== '1' && params.source !== '2';
      const validTarget = params.target !== '1' && params.target !== '2';

      if (validSource && validTarget) {
        setEdges((eds) =>
          addEdge({ ...params, type: 'custom', data: { onDeleteEdge: handleEdgeDelete } }, eds)
        );
      }
    },
    [setEdges, handleEdgeDelete]
  );

  const handleConfigClick = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
    }
  };

  const addNode = () => {
    const newNode: Node = {
      id: `${nodeId}`,
      type: 'custom',
      data: { label: `Node ${nodeId}`, onConfigClick: handleConfigClick, showConfig: false },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      style: { backgroundColor: '#ffffff' },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeId((id) => id + 1);
  };

  const undoLastAction = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  };

  const deleteNode = (id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };

  const onNodeMouseEnter = (_event: React.MouseEvent, node: Node) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === node.id
          ? { ...n, data: { ...n.data, showConfig: true, onConfigClick: handleConfigClick } }
          : n
      )
    );
  };

  const onNodeMouseLeave = (_event: React.MouseEvent, node: Node) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === node.id
          ? { ...n, data: { ...n.data, showConfig: false, onConfigClick: handleConfigClick } }
          : n
      )
    );
  };

  return (
    <div className="d-flex" style={{ height: '100vh' }}>
      <div className="flex-grow-1 position-relative">
        <div
          className="position-absolute d-flex gap-2"
          style={{ zIndex: 1000, top: 10, left: '50%', transform: 'translateX(-50%)' }}
        >
          <button className="btn btn-primary" onClick={addNode}>
            Add Node
          </button>
          <button className="btn btn-secondary" onClick={undoLastAction}>
            Undo
          </button>
        </div>
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          edges={edges}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_event, node) => setSelectedNode(node)}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          style={{ height: '100%', width: '100%' }}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
      <div className="border-start p-3" style={{ width: 300 }}>
        {selectedNode && (
          <PropertyPanel
            selectedNode={selectedNode}
            setNodes={setNodes}
            setEdges={setEdges}
            deleteNode={deleteNode}
            deleteEdge={(source, target) =>
              setEdges((eds) => eds.filter((edge) => !(edge.source === source && edge.target === target)))
            }
          />
        )}
      </div>
    </div>
  );
};

export default FlowCanvas;