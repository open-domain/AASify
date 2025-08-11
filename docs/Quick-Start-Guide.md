# AASify Quick Start Guide

## Getting Started with AASify

AASify is a Domain-Specific Language for creating Asset Administration Shells (AAS) in Industry 4.0. This guide will help you create your first AAS definition.

## Your First AAS

Let's create a simple AAS for a temperature sensor:

```aasify
environment MySensor {
    // Step 1: Define the physical asset
    asset "urn:company:sensor:temp:001" (TempSensor) {
        description "en": "Digital temperature sensor"
        kind Instance
        category "Sensor"
    }

    // Step 2: Create a submodel for sensor data
    submodel "urn:submodel:sensor_data" (SensorData) {
        description "en": "Temperature sensor readings and configuration"
        
        elements {
            // Current temperature reading
            property CurrentTemperature {
                description "en": "Current temperature reading"
                valueType double
                value 22.5
            }
            
            // Temperature range
            range OperatingRange {
                description "en": "Valid operating temperature range"
                valueType double
                min -40.0
                max 85.0
            }
            
            // Sensor configuration
            property SensorId {
                description "en": "Unique sensor identifier"
                valueType string
                value "TEMP-001"
            }
        }
    }

    // Step 3: Create the AAS
    aas "urn:aas:temp_sensor:001" (TempSensorAAS) {
        description "en": "Asset Administration Shell for temperature sensor"
        asset "urn:company:sensor:temp:001"
        submodels {
            "urn:submodel:sensor_data"
        }
    }
}
```

## Key Concepts in 5 Minutes

### 1. Environment
Every AASify file starts with an `environment` that contains all definitions:
```aasify
environment MyFactory {
    // All assets, submodels, and AAS definitions go here
}
```

### 2. Assets
Assets represent physical or logical objects:
```aasify
asset "unique-id" (ShortName) {
    description "en": "Human readable description"
    kind Instance  // or Type
}
```

### 3. Properties
Properties store data with specific types:
```aasify
property PropertyName {
    valueType double    // string, int, boolean, etc.
    value 42.0         // actual value
}
```

### 4. Submodels
Submodels group related properties and operations:
```aasify
submodel "submodel-id" (Name) {
    elements {
        property Prop1 { /* ... */ }
        property Prop2 { /* ... */ }
    }
}
```

### 5. AAS
The Asset Administration Shell connects everything:
```aasify
aas "aas-id" (Name) {
    asset "asset-id"           // links to asset
    submodels {               // includes submodels
        "submodel-id"
    }
}
```

## Common Patterns

### Multi-language Support
```aasify
mlproperty ProductName {
    value "en": "Smart Sensor",
          "de": "Intelligenter Sensor",
          "fr": "Capteur Intelligent"
}
```

### File References
```aasify
file UserManual {
    description "en": "Product user manual"
    mimeType "application/pdf"
    value "/docs/manual_v1.2.pdf"
}
```

### Collections
```aasify
collection Measurements {
    description "en": "All sensor measurements"
    ordered
    
    elements {
        property Temperature { /* ... */ }
        property Humidity { /* ... */ }
        property Pressure { /* ... */ }
    }
}
```

### Operations
```aasify
operation Calibrate {
    description "en": "Calibrate the sensor"
    
    inputVariables {
        var property CalibrationMode {
            valueType string
        }
    }
    
    outputVariables {
        var property Success {
            valueType boolean
        }
    }
}
```

### Events
```aasify
event TemperatureAlert {
    description "en": "Temperature exceeds threshold"
    direction output
    state on
    messageTopic "sensors/alerts/temperature"
}
```

## Step-by-Step Tutorial

### Step 1: Define Your Asset
Start by identifying what you want to digitally represent:
```aasify
asset "urn:mycompany:conveyor:belt:001" (ConveyorBelt) {
    description "en": "Main production line conveyor belt"
    kind Instance
    category "TransportEquipment"
}
```

### Step 2: Create Technical Data Submodel
Add technical specifications:
```aasify
submodel "urn:submodel:technical" (TechnicalSpecs) {
    elements {
        property Length {
            description "en": "Belt length in meters"
            valueType double
            value 25.0
        }
        
        property MaxSpeed {
            description "en": "Maximum belt speed in m/s"
            valueType double
            value 2.5
        }
        
        property Material {
            description "en": "Belt material"
            valueType string
            value "Rubber-reinforced"
        }
    }
}
```

### Step 3: Add Operational Data
Create another submodel for runtime data:
```aasify
submodel "urn:submodel:operational" (OperationalData) {
    elements {
        property CurrentSpeed {
            description "en": "Current belt speed"
            valueType double
            value 1.8
        }
        
        property Status {
            description "en": "Operational status"
            valueType string
            value "Running"
        }
        
        property RunningHours {
            description "en": "Total running hours"
            valueType int
            value 15420
        }
        
        operation Start {
            description "en": "Start the conveyor belt"
        }
        
        operation Stop {
            description "en": "Stop the conveyor belt"
        }
    }
}
```

### Step 4: Create the AAS
Bring it all together:
```aasify
aas "urn:aas:conveyor:001" (ConveyorAAS) {
    description "en": "Digital twin for conveyor belt system"
    
    administration admin {
        version "1.0"
        creator ref(GlobalReference, "urn:company:engineering:team")
    }
    
    asset "urn:mycompany:conveyor:belt:001"
    
    submodels {
        "urn:submodel:technical",
        "urn:submodel:operational"
    }
    
    views {
        view TechnicalView {
            description "en": "Technical specifications view"
            containedElements {
                Length,
                MaxSpeed,
                Material
            }
        }
        
        view OperationalView {
            description "en": "Real-time operational data"
            containedElements {
                CurrentSpeed,
                Status,
                RunningHours
            }
        }
    }
}
```

## Complete Example

Here's the complete conveyor belt example:

```aasify
environment ProductionLine {
    // Asset definition
    asset "urn:mycompany:conveyor:belt:001" (ConveyorBelt) {
        description "en": "Main production line conveyor belt"
        kind Instance
        category "TransportEquipment"
    }

    // Technical specifications
    submodel "urn:submodel:technical" (TechnicalSpecs) {
        elements {
            property Length {
                description "en": "Belt length in meters"
                valueType double
                value 25.0
            }
            
            property MaxSpeed {
                description "en": "Maximum belt speed in m/s"
                valueType double
                value 2.5
            }
            
            property Material {
                description "en": "Belt material"
                valueType string
                value "Rubber-reinforced"
            }
        }
    }

    // Operational data
    submodel "urn:submodel:operational" (OperationalData) {
        elements {
            property CurrentSpeed {
                description "en": "Current belt speed"
                valueType double
                value 1.8
            }
            
            property Status {
                description "en": "Operational status"
                valueType string
                value "Running"
            }
            
            property RunningHours {
                description "en": "Total running hours"
                valueType int
                value 15420
            }
            
            operation Start {
                description "en": "Start the conveyor belt"
            }
            
            operation Stop {
                description "en": "Stop the conveyor belt"
            }
        }
    }

    // Asset Administration Shell
    aas "urn:aas:conveyor:001" (ConveyorAAS) {
        description "en": "Digital twin for conveyor belt system"
        
        administration admin {
            version "1.0"
            creator ref(GlobalReference, "urn:company:engineering:team")
        }
        
        asset "urn:mycompany:conveyor:belt:001"
        
        submodels {
            "urn:submodel:technical",
            "urn:submodel:operational"
        }
        
        views {
            view TechnicalView {
                description "en": "Technical specifications view"
                containedElements {
                    Length,
                    MaxSpeed,
                    Material
                }
            }
            
            view OperationalView {
                description "en": "Real-time operational data"
                containedElements {
                    CurrentSpeed,
                    Status,
                    RunningHours
                }
            }
        }
    }
}
```

## Next Steps

1. **Explore Data Types**: Learn about all available data types in the [full reference guide](AASify-DSL-Reference.md)
2. **Add Semantic References**: Use concept descriptions to add semantic meaning
3. **Create Relationships**: Link related assets and properties
4. **Add Events**: Define notifications and alerts
5. **Use Collections**: Organize related data into structured collections

## Common Mistakes to Avoid

1. **Missing required properties**: Always include `valueType` for properties
2. **Incorrect references**: Ensure referenced elements are defined
3. **Wrong data types**: Match values with their declared types
4. **Missing quotes**: Use quotes around string literals and IDs
5. **Incomplete descriptions**: Provide meaningful descriptions for better understanding

## File Organization Tips

- Use one environment per file
- Group related assets in the same environment
- Consider splitting large environments into multiple files with imports
- Use consistent naming conventions
- Add comments to explain complex relationships

Ready to create your own AAS? Start with a simple asset and gradually add more complexity as you become familiar with the language!
