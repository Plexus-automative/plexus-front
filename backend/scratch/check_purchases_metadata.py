import xml.etree.ElementTree as ET

# Load metadata.xml
xml_path = '/Users/hemdaouitarek/Desktop/plexus-front/metadata.xml'
try:
    tree = ET.parse(xml_path)
    root = tree.getroot()
    namespaces = {'edm': 'http://docs.oasis-open.org/odata/ns/edm'}
    for entity_set in root.findall('.//edm:EntitySet', namespaces):
        print(f"EntitySet: {entity_set.attrib.get('Name')} -> EntityType: {entity_set.attrib.get('EntityType')}")
except Exception as e:
    print("Error reading metadata.xml:", e)
