export interface TopoJSONGeometry {
  type: 'Point' | 'MultiPoint' | 'LineString' | 'MultiLineString' | 'Polygon' | 'MultiPolygon' | 'GeometryCollection'
  arcs?: number[][] | number[]
  coordinates?: number[] | number[][] | number[][][]
  properties?: Record<string, any>
  geometries?: TopoJSONGeometry[]
}

export interface TopoJSONObject {
  type: 'GeometryCollection'
  geometries: TopoJSONGeometry[]
}

export interface TopoJSONTopology {
  type: 'Topology'
  arcs: number[][][]
  objects: {
    [key: string]: TopoJSONObject
  }
  transform?: {
    scale: [number, number]
    translate: [number, number]
  }
  bbox?: [number, number, number, number]
}

export interface GeoJSONFeature {
  type: 'Feature'
  properties: Record<string, any>
  geometry: {
    type: string
    coordinates: any
  }
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

export interface Area {
  id: number
  name: string
  coordinates: Array<{ lat: number; lng: number }>
  topojson?: TopoJSONTopology
  color?: string
  description?: string
  properties?: Record<string, any>
  createdBy?: {
    id: number
    name: string
  }
  createdAt: string
  updatedAt: string
}