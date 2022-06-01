const fs = require('fs') 
const path = require('path') 
const jsyaml = require('js-yaml')

// Read the spec.yml file and convert it to spec.json 
const spec = fs.readFileSync(path.join(__dirname, '/spec.yml'), 'utf8')
const specJson = jsyaml.load(spec)
fs.writeFileSync(path.join(__dirname, '/spec.json'), JSON.stringify(specJson, null, 2))

// Generate the html file
// TODO: Add the missing initial header content to the html file.
const htmlContent = []
const paths = specJson.paths
let paths_details = ''
// TODO: Move the CSS Styling to a separate file if possible. 
let css_html = `<style>
body {
    font-family: sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #000;
    background-color: #f7f7f7;
}

button {
    background-color: #000;
    color: #fff;
    border-radius: 10px;
    padding: 5px;
}

p {
    margin: 0 0 10px;
    padding: 0px;
}

.paths_container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
}
.path {
    background-color: #000;
    color: #fff;
    padding: 10px;
    width: 90%;
    text-align: left;
    margin: 0 auto;
}
.path-details {
    background-color: #f5f5f5;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    margin: 0 auto;
    width: 90%;
    text-align: center;
}
.get {
    
    background-image: linear-gradient(to bottom, #00FF00, #fff);
    border-radius: 5px;
    padding: 10px;
    margin: 0 auto;
    width: 90%;
    text-align: center;
}
.post {
    background-image: linear-gradient(to bottom, #0000FF, #fff);
    border-radius: 5px;
    padding: 10px;
    margin: 0 auto;
    width: 90%;
    text-align: center;
}
.put {
    background-image: linear-gradient(to bottom, #FFFF00, #fff);
    border-radius: 5px;
    padding: 10px;
    margin: 0 auto;
    width: 90%;
    text-align: center;
}
.delete {
    background-image: linear-gradient(to bottom, #FF0000, #fff);
    border-radius: 5px;
    padding: 10px;
    margin: 0 auto;
    width: 90%;
    text-align: center;
}
.parameter {
    background-color: #fff;
    border-radius: 5px;
    padding: 2px;
    margin: 0 auto;
    width: 80%;
    text-align: center;
}
.parameters {
    background-color: #efefef;
    border-radius: 5px;
    padding: 2px;
    margin: 0 auto;
    width: 90%;
    text-align: center;
}
.response {
    background-color: #fff;
    border-radius: 5px;
    padding: 2px;
    margin: 0 auto;
    width: 90%;
    text-align: center;
}
.response-bodies {
    background-color: #fff;
    line-height: .9;
}

.response-properties {
    list-style-type: none;
    padding: 0;
}

.set {
    background-color: ;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    margin: 0 auto;
    width: 90%;
    text-align: center;
}
</style>`

////////////////////////////////////////////////////////////////////////////////////////////

// Create section in the DOM for each path and include its methods.

const generateAllPathDetails = (paths) => {
    const details = Object.keys(paths).map(path => {
        // const path_name = path.split('/')[2] // can be used to display the path name in the html
        const path_details = generatePathMethods(path)
      return `<section class="set"> 
      <div class="path">${path}</div>
      ${path_details}
      </section>`
    }).join('')
    paths_details = details 
    // At this point, the CSS and path details are ready to be added to the html.
    htmlContent.push(css_html)
    htmlContent.push(paths_details)

}

const generatePathMethods = (path) => {
    const get_raw = paths[path].get
    const post_raw = paths[path].post
    const put_raw = paths[path].put
    const delete_raw = paths[path].delete
        
    let get_html = ''
    let post_html = ''
    let put_html = ''
    let delete_html = ''
    // Generate the html for each method and store it in the variables above.
    if (get_raw){
        get_html = generateMethodDetails(get_raw, 'GET')
    }
    if (post_raw){
        post_html = generateMethodDetails(post_raw, 'POST')
    }
    if (put_raw){
        put_html = generateMethodDetails(put_raw, 'PUT')
    }
    if (delete_raw){
        delete_html = generateMethodDetails(delete_raw, 'DELETE')
    }
    let all_methods = `${get_html} ${post_html} ${put_html} ${delete_html}`
    return all_methods
}

const generateMethodDetails = (method, type) => {
    const parameters = generateMethodParameters(method)
    const response_bodies = generateResponses(method)
    const tags = generateMethodTags(method.tags)
    const method_html = `<div class="${type.toLowerCase()}">
    <h3>${type}</h3>
    <p>${method.description}<br>
    ${tags}<br>
    ${method.operationId}<br>
    </p>
    <div class="parameters">
        <h4>Parameters</h4>
        ${parameters}
        </div>
    <div class="response-bodies">
        <h4>Responses</h4>
        ${response_bodies}
        </div>
    </div>`
    return method_html
}

const generateMethodTags = (tags) => { 
    let tag_buttons = []
    tags.forEach(tag => {
        tag_buttons.push(`<button class="tag">${tag}</button>`)
    })
    return tag_buttons.join('')

}

const generateMethodParameters = (method) => {
    const method_parameters = []
    if (method.parameters){
        method.parameters.forEach(parameter => {
            // if parameter is $ref, get the parameter name from the ref
            if (parameter.$ref){
                const ref_name = parameter.$ref.split('/')[3]
                const ref_link = specJson.components.parameters[ref_name]
                method_parameters.push(
                    `<div class="parameter">
                    <h5>${ref_link.name}</h5>
                    <p><strong>Type:</strong> ${ref_link.in}</p>
                    <p><strong>Format:</strong> ${ref_link.schema.type}</p>
                    <p><strong>Description:</strong> ${ref_link.description}</p>
                    <p><strong>Required:</strong> ${ref_link.required}</p>
                    </div>`
                )
            } 
        })
    }
    return method_parameters.join('')
}

const generateResponses = (method) => {
    let responses_content = ''
    let schemas_content = ''
    if (method.responses){
        const response = method.responses 
        const response_keys = Object.keys(method.responses)
        response_keys.forEach(key => {
            const response_value = response[key].content
            if (response_value){
                const schema = response_value["application/json"].schema 
            // if schema exists, get the schema properties
                if (schema.$ref){ 
                    const schema_name = schema.$ref.split('/')[3]
                    const schema_link = specJson.components.schemas[schema_name]
                    const schema_properties = schema_link.properties 
                    if (schema_properties){
                        // get the properties of the schema
                        const schema_properties_keys = Object.keys(schema_properties)
                        let schema_content = `
                        <h4>${key}</h4>
                        <ul class="response-properties">
                        ${schema_properties_keys.map(property => {
                            return `<li>${property}: ${schema_properties[property].type}</li>`
                        }).join('')}
                        </ul>`
                        schemas_content = schema_content
                        
                    }
        
                } else if (schema.allOf)  {
                    console.log(schema.allOf)
                } else if (schema.oneOf) {
                    console.log(schema.oneOf)
                } else if (schema.anyOf) {
                    console.log('anyOf: ' + schema.anyOf)
                } else if (schema.items) {
    
                    console.log('aaa: ' + schema.items)
                } else if (schema.type) {
                    console.log('bbb: ' +  schema.type  )
                } else if (schema.properties) {
                    console.log('ccc: ' + schema.properties)
                }

            }  
    
            responses_content += `<div class="response">
            <h5>${key}</h5>
            <p><strong>Description:</strong> ${response[key].description}</p>
            <p><strong>Schema:</strong> ${schemas_content} </p>
            </div>`
        })
    }

    return responses_content
}

// Create the index.html file for the documentation.
const updateHtmlFile = () => {
    fs.writeFileSync(path.join(__dirname, '/index.html'), htmlContent.join(''))
}

////////////////////////////////////////////////////////////////////////////////

generateAllPathDetails(paths)

updateHtmlFile()

