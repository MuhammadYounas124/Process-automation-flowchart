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
} from 'react-flow-renderer';
import PropertyPanel from './Propertypanel';

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

const edgeTypes = { custom: CustomEdge };

const initialNodes: Node[] = [
  {
    id: '1',
    data: { label: 'Start' },
    position: { x: 250, y: 500 },
    style: { backgroundColor: 'rgb(102, 238, 102)' },
  },
  {
    id: '2',
    data: { label: 'End' },
    position: { x: 250, y: 700 },
    style: { backgroundColor: 'red' },
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

  const addNode = () => {
    const newNode: Node = {
      id: `${nodeId}`,
      data: { label: `Node ${nodeId}` },
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
          ? { ...n, data: { ...n.data, showConfig: n.id !== '1' && n.id !== '2' } }
          : n
      )
    );
  };

  const onNodeMouseLeave = (_event: React.MouseEvent, node: Node) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === node.id
          ? { ...n, data: { ...n.data, showConfig: false } }
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
          edgeTypes={edgeTypes}
          fitView
          style={{ height: '100%', width: '100%' }}
        >
          <Background />
          <Controls />
          <MiniMap />
          {nodes.map((node) => (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: node.position.x + 10,
                top: node.position.y + 10,
                zIndex: 1000,
              }}
            >
              {node.data.showConfig && node.id !== '1' && node.id !== '2' && (
                <button
                  style={{
                    background: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedNode(node)}
                >
                  Config
                </button>
              )}
              {(node.id === '1' || node.id === '2') && node.data.showConfig && (
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '4px 8px',
                  }}
                >
                  No editable properties for this node.
                </div>
              )}
            </div>
          ))}
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