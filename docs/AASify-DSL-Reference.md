# AASify DSL Reference Guide

## Overview

AASify is a Domain-Specific Language (DSL) designed for defining Asset Administration Shells (AAS) in Industry 4.0 environments. It provides a human-readable, structured syntax for creating AAS models that comply with the Industrial Digital Twin Association (IDTA) specifications.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Environment Structure](#environment-structure)
3. [Keywords Reference](#keywords-reference)
4. [Data Types](#data-types)
5. [Examples](#examples)
6. [Best Practices](#best-practices)

## Core Concepts

### Asset Administration Shell (AAS)
The digital representation of an asset, containing metadata, submodels, and views that describe the asset's properties, capabilities, and behaviors.

### Asset
The physical or logical object being digitally represented, such as a machine, component, or process.

### Submodel
A structured collection of properties, operations, events, and other elements that describe specific aspects of an asset.

### Concept Description
Semantic definitions that provide meaning and context to data elements within the AAS.

## Environment Structure

Every AASify file starts with an `environment` declaration that contains all AAS-related definitions:

```aasify
environment EnvironmentName {
    // Imports, assets, submodels, concept descriptions, and AAS definitions
}
```

## Keywords Reference

### Top-Level Keywords

#### `environment`
**Syntax:** `environment [name] { ... }`
**Description:** Root container for all AAS definitions
**Example:**
```aasify
environment FactoryFloor {
    // All definitions go here
}
```

#### `import`
**Syntax:** `import "uri" [as alias]`
**Description:** Imports external AAS definitions
**Example:**
```aasify
import "common-concepts.aasify" as common
```

### Asset Definition

#### `asset`
**Syntax:** `asset "id" [(idShort)] { ... }`
**Description:** Defines a physical or logical asset
**Properties:**
- `description`: Multi-language text description
- `administration`: Administrative metadata
- `kind`: Asset type (Type | Instance)
- `category`: Classification category
- `billOfMaterial`: List of related assets

**Example:**
```aasify
asset "urn:example:robot:001" (IndustrialRobot) {
    description "en": "6-axis industrial robot arm"
    kind Instance
    category "PhysicalAsset"
}
```

#### `kind`
**Values:** `Type | Instance`
**Description:** Specifies whether the asset is a type definition or instance

### AAS Definition

#### `aas`
**Syntax:** `aas "id" [(idShort)] { ... }`
**Description:** Defines an Asset Administration Shell
**Required Properties:**
- `asset`: Reference to the represented asset
**Optional Properties:**
- `description`: Multi-language description
- `administration`: Administrative information
- `derivedFrom`: Reference to parent AAS
- `submodels`: List of associated submodels
- `views`: Custom views of the AAS data

**Example:**
```aasify
aas "urn:example:aas:robot:001" (RobotAAS) {
    description "en": "AAS for industrial robot"
    asset "urn:example:robot:001"
    submodels {
        "urn:example:submodel:technical_data",
        "urn:example:submodel:operational_data"
    }
}
```

### Submodel Definition

#### `submodel`
**Syntax:** `submodel "id" [(idShort)] { ... }`
**Description:** Defines a structured collection of elements
**Properties:**
- `description`: Multi-language description
- `administration`: Administrative metadata
- `semanticId`: Semantic reference
- `qualifiers`: Additional qualifiers
- `elements`: Contained submodel elements

### Submodel Elements

#### `property`
**Syntax:** `property idShort [(semanticId)] { ... }`
**Description:** Single-valued property with a specific data type
**Required Properties:**
- `valueType`: Data type of the property
**Optional Properties:**
- `value`: Property value
- `valueId`: Reference to the value
- `category`: Classification
- `qualifiers`: Additional metadata

**Example:**
```aasify
property MaxTemperature {
    description "en": "Maximum operating temperature"
    valueType double
    value 85.0
    qualifiers {
        qualifier "Unit" {
            valueType string
            value "°C"
        }
    }
}
```

#### `mlproperty`
**Syntax:** `mlproperty idShort [(semanticId)] { ... }`
**Description:** Multi-language property for internationalized text
**Example:**
```aasify
mlproperty ProductName {
    value "en": "Industrial Robot",
          "de": "Industrieroboter",
          "fr": "Robot Industriel"
}
```

#### `range`
**Syntax:** `range idShort [(semanticId)] { ... }`
**Description:** Defines a value range with minimum and maximum
**Properties:**
- `valueType`: Data type
- `min`: Minimum value
- `max`: Maximum value

#### `file`
**Syntax:** `file idShort [(semanticId)] { ... }`
**Description:** Reference to an external file
**Required Properties:**
- `mimeType`: MIME type of the file
**Optional Properties:**
- `value`: File path or URI

#### `blob`
**Syntax:** `blob idShort [(semanticId)] { ... }`
**Description:** Binary data embedded in the AAS
**Required Properties:**
- `mimeType`: MIME type of the data

#### `collection`
**Syntax:** `collection idShort [(semanticId)] { ... }`
**Description:** Ordered or unordered collection of submodel elements
**Properties:**
- `ordered`: Whether the collection is ordered
- `allowDuplicates`: Whether duplicates are allowed
- `elements`: Contained elements

#### `operation`
**Syntax:** `operation idShort [(semanticId)] { ... }`
**Description:** Defines a callable operation or function
**Properties:**
- `inputVariables`: Input parameters
- `outputVariables`: Output parameters
- `inoutputVariables`: Input/output parameters

#### `event`
**Syntax:** `event idShort [(semanticId)] { ... }`
**Description:** Defines an event or notification
**Properties:**
- `direction`: Event direction (input | output)
- `state`: Event state (on | off)
- `messageTopic`: Message topic for pub/sub
- `messageBroker`: Message broker reference

#### `entity`
**Syntax:** `entity idShort [(semanticId)] { ... }`
**Description:** Represents a self-contained entity
**Required Properties:**
- `entityType`: Type of entity (CoManagedEntity | SelfManagedEntity)

### References

#### `ref`
**Syntax:** `ref(type [, keys])`
**Description:** Creates a reference to another AAS element
**Types:**
- `GlobalReference`: External reference
- `ModelReference`: Internal model reference

**Example:**
```aasify
property Temperature (ref(ModelReference, TemperatureConcept)) {
    valueType double
}
```

### Concept Descriptions

#### `concept`
**Syntax:** `concept "id" [(idShort)] { ... }`
**Description:** Defines semantic concepts for data elements
**Properties:**
- `description`: Concept description
- `category`: Concept category
- `embeddedDataSpecifications`: Data specifications

### Administrative Information

#### `admin`
**Syntax:** `admin { ... }`
**Description:** Administrative metadata
**Properties:**
- `version`: Version string
- `revision`: Revision number
- `creator`: Creator reference
- `templateId`: Template identifier

### Qualifiers

#### `qualifier`
**Syntax:** `qualifier "type" [(semanticId)] { ... }`
**Description:** Additional metadata for elements
**Properties:**
- `valueType`: Data type of qualifier value
- `value`: Qualifier value
- `valueId`: Reference to value

## Data Types

AASify supports the following data types:

### Primitive Types
- `string`: Text data
- `boolean`: True/false values
- `int`: 32-bit integer
- `long`: 64-bit integer
- `short`: 16-bit integer
- `byte`: 8-bit integer
- `double`: Double-precision floating point
- `float`: Single-precision floating point
- `decimal`: Arbitrary precision decimal

### Unsigned Types
- `unsignedInt`, `unsignedLong`, `unsignedShort`, `unsignedByte`

### Date/Time Types
- `dateTime`: Date and time
- `date`: Date only
- `time`: Time only
- `duration`: Time duration

### Binary Types
- `base64Binary`: Base64-encoded binary data
- `hexBinary`: Hexadecimal-encoded binary data

### Other Types
- `anyURI`: URI reference

## Examples

### Complete AAS Definition

```aasify
environment SmartFactory {
    // Define the asset
    asset "urn:factory:machine:press:001" (HydraulicPress) {
        description "en": "Hydraulic forming press"
        kind Instance
        category "ProductionEquipment"
    }

    // Define concept for pressure
    concept "urn:concepts:pressure" (PressureConcept) {
        description "en": "Hydraulic pressure measurement"
        embeddedDataSpecifications {
            dataSpec ref(GlobalReference, "http://example.com/pressure")
            iec61360 {
                preferredName "en": "Pressure"
                unit "bar"
                dataType double
            }
        }
    }

    // Define submodel
    submodel "urn:submodel:technical" (TechnicalData) {
        description "en": "Technical specifications"
        
        elements {
            property MaxPressure (ref(ModelReference, PressureConcept)) {
                description "en": "Maximum operating pressure"
                valueType double
                value 300.0
            }
            
            range OperatingPressure (ref(ModelReference, PressureConcept)) {
                description "en": "Normal operating pressure range"
                valueType double
                min 50.0
                max 250.0
            }
            
            operation StartPress {
                description "en": "Start press operation"
                inputVariables {
                    var property Pressure {
                        valueType double
                    }
                }
                outputVariables {
                    var property Success {
                        valueType boolean
                    }
                }
            }
        }
    }

    // Define the AAS
    aas "urn:aas:press:001" (PressAAS) {
        description "en": "AAS for hydraulic press"
        asset "urn:factory:machine:press:001"
        submodels {
            "urn:submodel:technical"
        }
    }
}
```

### Multi-language Support

```aasify
mlproperty InstructionsText {
    description "en": "Operating instructions"
    value "en": "Press the green button to start",
          "de": "Drücken Sie den grünen Knopf zum Starten",
          "fr": "Appuyez sur le bouton vert pour démarrer",
          "es": "Presione el botón verde para comenzar"
}
```

### Collections and Relationships

```aasify
collection SensorReadings {
    description "en": "All sensor readings"
    ordered
    
    elements {
        property Temperature {
            valueType double
            value 23.5
        }
        property Pressure {
            valueType double
            value 2.1
        }
        property Vibration {
            valueType double
            value 0.05
        }
    }
}

relationship TempSensorLocation {
    description "en": "Temperature sensor location"
    first ref(ModelReference, Temperature)
    second ref(GlobalReference, "urn:location:zone:a")
}
```

## Best Practices

### 1. Naming Conventions
- Use descriptive, CamelCase names for idShort values
- Use URN format for global identifiers
- Keep names consistent across related elements

### 2. Organization
- Group related elements in collections
- Use separate submodels for different aspects (technical, operational, maintenance)
- Define reusable concepts for common properties

### 3. Documentation
- Always provide meaningful descriptions
- Use multi-language support for international deployments
- Include units and value ranges where applicable

### 4. References
- Use semantic references to link to standard concepts
- Prefer ModelReference for internal references
- Use GlobalReference for external standards

### 5. Versioning
- Include version information in administrative data
- Use semantic versioning for AAS definitions
- Document changes in revision notes

## Error Handling

Common syntax errors and their solutions:

### Missing Required Properties
```aasify
// ❌ Wrong - missing required valueType
property Temperature {
    value 25.0
}

// ✅ Correct
property Temperature {
    valueType double
    value 25.0
}
```

### Invalid References
```aasify
// ❌ Wrong - undefined reference
property Temp (ref(ModelReference, UndefinedConcept)) {
    valueType double
}

// ✅ Correct - reference to defined concept
property Temp (ref(ModelReference, TemperatureConcept)) {
    valueType double
}
```

### Incorrect Data Types
```aasify
// ❌ Wrong - string value for numeric type
property Count {
    valueType int
    value "not a number"
}

// ✅ Correct
property Count {
    valueType int
    value 42
}
```

This DSL provides a comprehensive framework for defining AAS structures while maintaining readability and compliance with Industry 4.0 standards.
