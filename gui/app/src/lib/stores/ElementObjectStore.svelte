<script lang="ts" context='module'>
    import type { ElementDetail, ElementObject } from "$lib/interfaces/ElementObject";
    import type { ElementObjectCategory  } from "$lib/interfaces/ElementObject";
    import type { Object_Element_Instance } from "$lib/interfaces/ElementObject";
    import type { ObjectElementSubElement } from "$lib/interfaces/ElementObject";
    import type { DataKey } from "$lib/interfaces/ElementObject";
    import { writable, type Writable } from "svelte/store";
    import { produce } from "immer";
    import type { ElementObjectRegistry } from "$lib/interfaces/ElementObject";
// Define the store's data structure

function getInitialData(): ElementObjectRegistry {
// Your definitions

    const DefintionsSubElements: ObjectElementSubElement[] = [
        { name: 'Statement', uid: '31' }, 
        { name: 'Word', uid: '33' }
    ];
    
    const DefinitionsObject: ElementObject = {
        name: 'Definitions',
        uid: '30',
        'category': 'Unique Identifiers',
        ObjectElementSubElements: DefintionsSubElements,
        instances: []
    };

    const DescriptionSubElements: ObjectElementSubElement[] = [
        { name: 'Account', uid: '23' }, 
        { name: 'Detail', uid: '22' }
    ];
    
    const DescriptionElement: ElementObject = {
        name: 'Description',
        'category': 'Unique Identifiers',
        uid: '22',
        ObjectElementSubElements: DescriptionSubElements,
        instances: []
    };

    const ControllerExecutorSubElements: ObjectElementSubElement[] = [
        { name: 'Controller', uid: '23' }, 
        { name: 'Executor', uid: '25' }
    ];
    
    const ControllerExecutorElement: ElementObject = {
        name: 'Controller-Executor',
        'category': 'Role Based Relationships',
        uid: '22',
        ObjectElementSubElements: ControllerExecutorSubElements,
        instances: []
    };

    const SynonymousSubElements: ObjectElementSubElement[] = [
        { name: 'Synonym', uid: '22' }, 
        { name: 'Nuance', uid: '22' }
    ];
    
    const SynonymousElement: ElementObject = {
        name: 'Synonymous',
        'category': 'Symmetric Relationships',
        uid: '22',
        ObjectElementSubElements: SynonymousSubElements,
        instances: []
    };
      const IPOSubElements: ObjectElementSubElement[] = [
        { name: 'Input', uid: '38' },
        { name: 'Process', uid: '39' }, 
        { name: 'Output', uid: '40' }
    ];
    
    const IPOElement: ElementObject = {
        name: 'IPO',
        'category': 'Interactions',
        uid: '37',
        ObjectElementSubElements: IPOSubElements,
        instances: []
    };

    const SubElement: ElementObject = {
        name: 'Subelement',
        'category': 'SubElements',
        uid: '41',  // Give it a unique uid
        ObjectElementSubElements: IPOSubElements,  // Or define its own subelements
        instances: []
    };

    return {
        name: '',
        categories: {
        'Unique Identifiers': {
            name: 'Unique Identifiers',
            uid: '22',
            element_objects: {
            'Description': DescriptionElement,
            'Definitions': DefinitionsObject
            }
        },
        'Role Based Relationships': {
            name: 'Role Based Relationships',
            uid: '22',
            element_objects: {
            'Controller-Executor': ControllerExecutorElement
            }
        },
        'Symmetric Relationships': {
            name: 'Symmetric Relationships',
            uid: '22',
            element_objects: {
            'Synonymous Relationship': SynonymousElement
            }
        },
         'Interactions': {
                name: 'Interactions',
                uid: '36',  // Give it a unique uid
                element_objects: {
                    'IPO': IPOElement
                }
            },
            'SubElements': {
                name: 'SubElements',
                uid: '37',  // Give it a unique uid
                element_objects: {
                }
            }, 
            'Types': {
                'name': 'Types',
                'uid': '33',
                element_objects: {
                }
            },
            'Kinds': {
                'name': 'Kinds',
                'uid': '22',
                'element_object_lists': []

                
            }
        },
        
        
        
    };  

}
function Create_Element_Object_Store() {
    //intialize predefined data, eventually get from database but for now define in code
    //make method to get element object and their instancec
  const { subscribe, set, update }: Writable<ElementObjectRegistry> = writable(getInitialData());
    return{
        subscribe,
        Create_Object_Element_Instance(Instance: Object_Element_Instance) {
        update(state => produce(state, draft => {
            // draft.instances[Instance.label] = Instance;

            const target = draft.categories[Instance.category]?.element_objects?.[Instance.object_element_name]
            if (!target) {
                console.error(`Invalid category ${Instance.category} object element name ${Instance.object_element_name}`)
            } else if (target) {
                target.instances?.push(Instance)

            }
            //this is probably the line that is adding the instances to the end of the dict
        }));
        },
        Add_SubElement(Sub_Element: ElementDetail) {
            update(state => produce(state, draft => {
                console.log(`structure ${draft.categories['SubElements']}`)
                const target = draft.categories['SubElements'].element_objects;

                if (!target) {
                    console.error(`Failed to add subelement ${Sub_Element.name} to store`)
                } else if (target) {
                    target[Sub_Element.name] = Sub_Element;


                }
                //add to key value pairs or regular elements
                
            }))
        },
        Add_Object_Element(Instance: ElementObject) {
            update(state => produce(state, draft => {
                console.log(`instance category ${Instance.category}`)
                const target = draft.categories[Instance.category]?.element_objects
                if (!target) {
                    console.error(`Something went wrong with ${Instance.name} element object being added to store`)
                } else if (target) {
                    target[Instance.name] = Instance;

                }

            }))
        },
        Add_Kind(kind_name: string) {
            update(state => produce(state, draft => {
                const target = draft.categories.Kinds.element_object_lists
                if (!target) {
                    console.error(`Something when wrong when saving ${kind_name} in store`)
                } else if (target) {
                    target.push(kind_name)

                }
            }))
        },
        Set_Name(name: string) {
            update(state => produce(state, draft => {
                draft.name = name;
            }))
        },
        Delete_Object_Element_Instance(label: string) {
            update(state => produce(state, draft => {
            //     const Instance = draft.instances?[label];
            //     if (!Instance) {
            //         console.log(`instance ${label} not found`)
            //     }
            // // //delete from flat look
            // // delete draft.instances[label]
            // // const target = draft.categories[Instance.category]?.element_objects[Instance.object_element_name];
            // // if (target?.instances) {
            // //     target.instances = target.instances.filter(i => i.label !== label)
            // // }

            }))
        },
         snapshot(): ElementObjectRegistry {
            let currentState!: ElementObjectRegistry; // ← Changed variable name
            const unsubscribe = subscribe(registry => {
                currentState = registry;
            });
            unsubscribe();
            return currentState; // ← Return the renamed variable
        }
    };

    }

        //add new
        // function Add_New(Object_Element_Instance: Object_Element_Instance) {
        //     const Category = Get_Data_For_Category(Object_Element_Instance.category);//get the category and object element it belongs to and add it there
        //     const Object_Element_Data = Category.element_objects[Object_Element_Instance.object_element_name];
        //     Object_Element_Data.instances?.push(Object_Element_Instance);
        // }
        //make method that modifies and edit
        function modify(Object_Element_Instance: Object_Element_Instance) {
            const Category = Get_Data_For_Category(Object_Element_Instance.category);//get the category and object element it belongs to and add it there
            const Object_Element_Data = Category.element_objects?.[Object_Element_Instance.object_element_name];

        }
            
    //     function Get_Store_By_Name(name: string, object_element_uid: string) {

    // }

        
        function Get_Data_For_Category(category: DataKey): ElementObjectCategory {
            const DefintionsSubElements: ObjectElementSubElement[] = [{'name': 'Statement', 'uid': '31'}, {'name': 'Word', 'uid': '33'}]
                const DefinitionsObject:ElementObject = {
                    "name": 'Definitions',
                    'uid': '30',
                    'category': 'Unique Identifiers',
                    'ObjectElementSubElements': DefintionsSubElements
                }
            const DescriptionSubELements:ObjectElementSubElement[]  = [{'name': 'Account', 'uid': '23'}, {'name': 'Detail', 'uid': '22'}]
                    const Description_Element: ElementObject = {'name': 'Description', 'uid': '22', 'ObjectElementSubElements': DescriptionSubELements, 'category': 'Unique Identifiers'}
            let subelements1 = [{'name': 'Controller', 'uid': '23'}, {'name': 'Executor', 'uid': '25'}]
            let relationship_element_object1: ElementObject = {'name': 'Controller-Executor',
                                                'uid': '22',
                                                'ObjectElementSubElements': subelements1, 'category': 'Role Based Relationships'
            };
            let Synonymous_Relationship: ElementObject = {'name': 'Synonmous', 'uid': '22', 'category': 'Symmetric Relationships', 'ObjectElementSubElements': [{'name': 'Synonym', 'uid': '22'}, {'name': 'Nuance', 'uid': '22'}] }
               const subelements = [{'name': 'Input', 'uid': '38'},{
                            'name': 'Process', 'uid': '39'}, {
                            'name': 'Output', 'uid': '40'}
        ]
        const data: ElementObject= {'name': 'IPO',
                    'uid': '37',
                    'category': 'Interactions',
                    'ObjectElementSubElements': subelements
        }
            const All_Data = { 'name': '',
                'Unique Identifiers': {
                'name': 'Unique Identifiers',
                'uid': '22',
                'element_objects': {
                    'Description': Description_Element,
                    'Definitions': DefinitionsObject
                }
                
                        }, 
                'Role Based Relationships': {
                        'name': 'Role Based Relationships',
                        'uid': '22',
                        'element_objects': {
                            'Controller-Executor': relationship_element_object1

                        }
                    
                    }, 
                'Symmetric Relationships': {
                        'name': 'Symmetric Relationships',
                        'uid': '22',
                        'element_objects': {
                            "Synonymous Relationship": Synonymous_Relationship} },
                'Interactions': {
                    'name': 'Interactions',
                    'uid': '22',
                    'element_objects': {
                        'IPO': data
                    }
                },
            'SubElements': {
                'name': 'SubElements',
                'uid': '22',
                'element_objects': {
                }
                
               
            },
        'Types': {
            'name': 'Types',
            'uid': '22',
            'element_objects': {
            }
        },
        'Kinds': {
            'name': 'Kinds',
            'uid': '29',
            'element_objects_lists': []

            
        }
        }
            
            const return_data: ElementObjectCategory = All_Data[category];
                        
                //go to the database and get data
            return return_data; 
        
        }
        
        
    


    //modify

    //delete
export const elementObjectStore = Create_Element_Object_Store();
</script>