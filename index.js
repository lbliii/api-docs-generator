const fs = require('fs') 
const path = require('path') 
const jsyaml = require('js-yaml')

// Read the spec.yml file and convert it to spec.json 
const spec = fs.readFileSync(path.join(__dirname, '/spec.yml'), 'utf8')
const specJson = jsyaml.load(spec)
fs.writeFileSync(path.join(__dirname, '/spec.json'), JSON.stringify(specJson, null, 2))

// Generate the html file
const htmlContent = []
const paths = specJson.paths
let paths_details = ''
// TODO: Move the CSS Styling to a separate file. 
let css_html = `<style>
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

// Create section in the DOM for each path and include its methods.

const generateAllPathDetails = (paths) => {
    const details = Object.keys(paths).map(path => {
        const path_name = path.split('/')[1]
        const path_details = generatePathMethods(path)
      return `<section class="set"> 
      <h2>${path_name}</h2>
      <div class="path">${path}</div>
      ${path_details}
      </section>`
    }).join('')
    paths_details = details 

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
        const parameters = generateMethodParameters(get_raw)
        const request_bodies = generateResponses(get_raw)
        get_html = `<div class="get">
        <h3>GET</h3>
        <p>${get_raw.description}</p>
        <p>${get_raw.tags}</p>
        <p>${get_raw.operationId}</p>
        <div class="parameters">
            <h4>Parameters</h4>
            ${parameters}
        </div>
        <div class="request_body">
            <h4>Request Body</h4>
            ${request_bodies}
        </div>
        </div>`
    }
    if (post_raw){
        const parameters = generateMethodParameters(post_raw)
        const request_bodies = generateResponses(post_raw)
        post_html = `<div class="post">
        <h3>POST</h3>
        <p>${post_raw.description}</p>
        <p>${post_raw.tags}</p>
        <p>${post_raw.operationId}</p>
        <div class="parameters">
            <h4>Parameters</h4>
            ${parameters}
        </div>
        <div class="request_body">
            <h4>Request Body</h4>
            ${request_bodies}
        </div>
        </div>`
    }
    if (put_raw){
        const parameters = generateMethodParameters(put_raw)
        const request_bodies = generateResponses(put_raw)
        put_html = `<div class="put">
        <h3>PUT</h3>
        <p>${put_raw.description}</p>
        <p>${put_raw.tags}</p>
        <p>${put_raw.operationId}</p>
        <div class="parameters">
            <h4>Parameters</h4>
            ${parameters}
            </div>
        <div class="request_body">
            <h4>Request Body</h4>
            ${request_bodies}
        </div>
        </div>`
    }
    if (delete_raw){
        const parameters = generateMethodParameters(delete_raw)
        const request_bodies = generateResponses(delete_raw)
        delete_html = `<div class="delete">
        <h3>DELETE</h3>
        <p>${delete_raw.description}</p>
        <p>${delete_raw.tags}</p>
        <p>${delete_raw.operationId}</p>
        <div class="parameters">
            <h4>Parameters</h4>
            ${parameters}
            </div>
        <div class="request_body">
            <h4>Request Body</h4>
            ${request_bodies}
         </div>
        </div>`
    }
    let all_methods = `${get_html} ${post_html} ${put_html} ${delete_html}`
    return all_methods
}

const generateMethodParameters = (method) => {
    const method_parameters = []
    if (method.parameters){
        method.parameters.forEach(parameter => {
            // if parameter is $ref, get the parameter name from the ref
            if (parameter.$ref){
                const ref_name = parameter.$ref.split('/')[3]
                const ref_link = specJson.components.parameters[ref_name]
                console.log(ref_link)
                method_parameters.push(
                    `<div class="parameter">
                    <h5>${ref_link.name}</h5>
                    <p><strong>Type:</strong> ${ref_link.in}</p>
                    <p><strong>Description:</strong> ${ref_link.description}</p>
                    <p><strong>Required:</strong> ${ref_link.required}</p>
                    </div>`
                )
            } else {
            method_parameters.push(`<div class="parameter">
            <h5>${parameter.name}</h5>
            <p><strong>Type:</strong> ${parameter.in}</p>
            <p><strong>Description:</strong> ${parameter.description}</p>
            <p><strong>Required:</strong> ${parameter.required}</p>
            </div>`)
            }
        })
    }
    return method_parameters.join('')
}


const generateResponses = (method) => {
    let responses_content = ''
    if (method.responses){
        const response = method.responses 
        const response_keys = Object.keys(response)
        response_keys.forEach(key => {
            console.log(key)
            responses_content += `<div class="response">
            <h5>${key}</h5>
            <p><strong>Description:</strong> ${response[key].description}</p>
            <p><strong>Schema:</strong> ${key}</p>
            </div>`
        })
    }

    return responses_content
}


// Create the index.html file for the documentation.
const updateHtmlFile = () => {
    fs.writeFileSync(path.join(__dirname, '/index.html'), htmlContent.join(''))
    }


// Execute the function that generates the html for each path.

generateAllPathDetails(paths)

    htmlContent.push(css_html)
    htmlContent.push(paths_details)

updateHtmlFile()

