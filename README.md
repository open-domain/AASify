# AASify

A Domain-Specific Language (DSL) for defining Asset Administration Shells (AAS) in Industry 4.0 environments. AASify provides an intuitive, human-readable syntax for creating digital twins and managing industrial assets according to the Industrial Digital Twin Association (IDTA) specifications.

## Features

- **Human-readable syntax** for AAS definitions
- **Complete AAS metamodel support** including assets, submodels, properties, operations, and events
- **Multi-language support** for international deployments
- **Semantic references** to standard concepts and vocabularies
- **Type safety** with comprehensive data type support
- **VS Code extension** with syntax highlighting and validation
- **Extensible architecture** for custom industrial domains

## Quick Start

### Installation

1. Install the AASify VS Code extension from the marketplace
2. Create a new file with `.aasify` extension
3. Start defining your Asset Administration Shells!

### Your First AAS

```aasify
environment MyFactory {
    // Define the asset
    asset "urn:company:robot:001" (IndustrialRobot) {
        description "en": "6-axis industrial robot"
        kind Instance
        category "ProductionEquipment"
    }

    // Create a submodel for technical data
    submodel "urn:submodel:technical" (TechnicalData) {
        elements {
            property MaxPayload {
                description "en": "Maximum payload capacity"
                valueType double
                value 25.0
            }
            
            property WorkingRadius {
                description "en": "Maximum working radius"
                valueType double
                value 1.8
            }
        }
    }

    // Define the AAS
    aas "urn:aas:robot:001" (RobotAAS) {
        description "en": "Digital twin for industrial robot"
        asset "urn:company:robot:001"
        submodels {
            "urn:submodel:technical"
        }
    }
}
```

## Documentation

- **[Quick Start Guide](docs/Quick-Start-Guide.md)** - Get up and running in 5 minutes
- **[DSL Reference Guide](docs/AASify-DSL-Reference.md)** - Complete language reference with all keywords and syntax
- **[Examples](examples/)** - Real-world examples and use cases

## Language Features

### Core AAS Elements

- **Assets**: Physical or logical objects being digitally represented
- **Asset Administration Shells**: Digital twins containing asset metadata and capabilities
- **Submodels**: Structured collections of properties, operations, and events
- **Properties**: Typed data values with semantic meaning
- **Operations**: Callable functions and procedures
- **Events**: Notifications and alerts
- **Relationships**: Connections between elements

### Advanced Features

- **Multi-language text**: Support for internationalization
- **Semantic references**: Link to standard vocabularies and ontologies
- **Data type validation**: Comprehensive type system with validation
- **Collections**: Organized groups of related elements
- **Views**: Custom perspectives on AAS data
- **Qualifiers**: Additional metadata and constraints

## Development

### Prerequisites

- Node.js (>=18.0.0)
- npm (>=10.0.0)
- VS Code (for extension development)

### Building from Source

```bash
# Clone the repository
git clone https://github.com/open-domain/AASify.git
cd AASify

# Install dependencies
npm install

# Generate Langium grammar and build
npm run build:all

# Run tests
npm test
```

### VS Code Extension Development

```bash
# Generate grammar
npm run langium:generate

# Build extension
npm run build:extension

# Install extension for development
code --install-extension ./aasify-*.vsix
```

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Reporting issues
- Submitting feature requests
- Contributing code
- Documentation improvements

## Examples

Check out the [examples directory](examples/) for comprehensive examples including:

- Manufacturing equipment AAS definitions
- Sensor networks and IoT devices
- Process automation scenarios
- Multi-asset factory environments

## Standards Compliance

AASify is designed to be compliant with:

- **IDTA specifications** for Asset Administration Shells
- **IEC 61360** for concept descriptions
- **Industry 4.0** reference architecture models
- **OPC UA** information models (planned)

## License

This project is licensed under the [MIT License](LICENSE).

## Community

- **GitHub Issues**: [Report bugs and request features](https://github.com/open-domain/AASify/issues)
- **Discussions**: [Join the community discussion](https://github.com/open-domain/AASify/discussions)
- **Documentation**: [Contribute to docs](docs/)

## Roadmap

- [ ] Code generation for various AAS implementations
- [ ] Integration with AAS repositories and registries
- [ ] Real-time data binding and synchronization
- [ ] Visual AAS modeling tools
- [ ] OPC UA server generation
- [ ] Cloud deployment templates
