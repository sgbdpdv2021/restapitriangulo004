import {Request, Response, Router } from 'express'
import { Triangulos, Triangulo, tTriangulo } from '../model/triangulo'
import { db } from '../database/database'

class TrianguloRoutes {
    private _router: Router

    constructor() {
        this._router = Router()
    }
    get router(){
        return this._router
    }

    private getTriangulos = async (req: Request, res: Response) => {
        await db.conectarBD()
        .then( async (mensaje) => {
            console.log(mensaje)
            const query = await Triangulos.find()
            console.log(query)
            res.json(query)
        })
        .catch((mensaje) => {
            res.send(mensaje)
            console.log(mensaje)
        })

        db.desconectarBD()
    }
  

    private nuevoTrianguloPost = async (req: Request, res: Response) => {
        console.log(req.body)
        // Observar la diferencia entre req.body (para POST) 
        // y req.params (para GET con los parámetros en la URL
        const { nombre, base, altura, lado1, lado2 } = req.body

        console.log(nombre)

        const dSchema = {
            _nombre: nombre,
            _base: parseInt(base),
            _lado2: parseInt(lado1),
            _lado3: parseInt(lado2),
            _altura: parseInt(altura)
        }
        console.log(dSchema)
        const oSchema = new Triangulos(dSchema)
        await db.conectarBD()
        await oSchema.save()
        .then( (doc) => {
            console.log('Salvado Correctamente: '+ doc)
            res.json(doc)
        })
        .catch( (err: any) => {
            console.log('Error: '+ err)
            res.send('Error: '+ err)
        }) 
        // concatenando con cadena muestra sólo el mensaje
        await db.desconectarBD()
    }     

    private nuevoTrianguloGet = async (req: Request, res: Response) => {
        const { nombre, base, altura, lado1, lado2 } = req.params
        console.log(req.params)

        await db.conectarBD()
        const dSchema = {
            _nombre: nombre,
            _base: parseInt(base),
            _lado2: parseInt(lado1),
            _lado3: parseInt(lado2),
            _altura: parseInt(altura)
        }
        const oSchema = new Triangulos(dSchema)
        await oSchema.save()
        .then( (doc) => {
            console.log('Salvado Correctamente: '+ doc)
            res.json(doc)
        })
        .catch( (err: any) => {
            console.log('Error: '+ err)
            res.send('Error: '+ err)
        }) 
        // concatenando con cadena muestra sólo el mensaje
        await db.desconectarBD()
    }  
    private getArea = async (req: Request, res: Response) => {
        let triangulo: Triangulo
        let sup: number = 0
        const {nombre } = req.params
        await db.conectarBD()
        .then( async (mensaje) => {
            console.log(mensaje)
            await Triangulos.findOne({_nombre: nombre},
                (error, doc: any) => {
                    if(error) console.log(error)
                    else{
                        if (doc == null) {
                            console.log('No existe')
                            res.json({})
                        }else {
                            console.log('Existe: '+ doc)
                            triangulo = 
                                new Triangulo(doc._nombre, doc._base, 
                                    doc._lado2, doc._lado3)
                            triangulo.altura = doc._altura  
                            sup = triangulo.area()
                            res.json({"nombre": nombre, "area": sup})
                        }
                    }
                }
            )

        })
        .catch((mensaje) => {
            res.send(mensaje)
            console.log(mensaje)
        })

        db.desconectarBD()
    }


    private getAreav2 = async (req: Request, res: Response) => {
        const { nombre } = req.params
        await db.conectarBD()
        .then( async (mensaje) => {
            console.log(mensaje)
            const query: any = await Triangulos.findOne({_nombre: nombre})
            if (query == null){
                console.log(query)
                res.json({})
            }else{
                const triangulo = new Triangulo(query._nombre, query._base, 
                    query._lado2, query._lado3)
                triangulo.altura = query._altura  
                console.log(triangulo)
                res.json({"nombre": triangulo.nombre, "area": triangulo.area()})
            }

        })
        .catch((mensaje) => {
            res.send(mensaje)
            console.log(mensaje)
        })
        db.desconectarBD()
    }

    private getDelete = async (req: Request, res: Response) => {
        const {nombre } = req.params
        await db.conectarBD()
        await Triangulos.findOneAndDelete(
            { _nombre: nombre }, 
            (err: any, doc) => {
                if(err) console.log(err)
                else{
                    if (doc == null) {
                        console.log(`No encontrado`)
                        res.send(`No encontrado`)
                    }else {
                        console.log('Borrado correcto: '+ doc)
                        res.send('Borrado correcto: '+ doc)
                    }
                }
            })
        db.desconectarBD()
    }

    private getAreas =  async (req: Request, res: Response) => {
        type tDoc = {
            nombre: String,
            area: Number
        }
        let arrayT: Array<tDoc> = new Array<tDoc>()
        await db.conectarBD()
        let tmpTriangulo: Triangulo
        let dTriangulo: any 
        const query =  await Triangulos.find( {} )
        for (dTriangulo of query){
            tmpTriangulo = 
                new Triangulo(dTriangulo._nombre, dTriangulo._base, 
                        dTriangulo._lado2, dTriangulo._lado3)
            tmpTriangulo.altura = dTriangulo._altura 
            const doc = {
                nombre:  dTriangulo._nombre,
                area: tmpTriangulo.area()
            }
            arrayT.push(doc)

            console.log(`Triángulo ${tmpTriangulo.nombre} Área: ${tmpTriangulo.area()}`)

        }
        console.log(arrayT)
        res.json(arrayT)
        await db.desconectarBD()   
    }
    private actualiza = async (req: Request, res: Response) => {
        const { nombre }= req.params
        const { base, altura, lado2, lado3 } = req.body
        await db.conectarBD()
        const doc: any = await Triangulos.findOneAndUpdate(
                { _nombre: nombre }, 
                {
                    _nombre: nombre,
                    _base: base,
                    _lado2: lado2,
                    _lado3: lado3,
                    _altura: altura
                },
                {
                    new: true,
                    runValidators: true // para que se ejecuten las validaciones del Schema
                }  
            )
            .then((docu) => {
                    console.log('Modificado Correctamente: '+ docu) 
                    res.json(docu)
                }
            )
            .catch( (err) => {
                console.log('Error: '+err)
                res.json({error: 'Error: '+err })
            }
            ) // concatenando con cadena muestra mensaje
        db.desconectarBD()
    }

    misRutas(){
        this._router.get('/', this.getTriangulos)
        this._router.get('/nuevoG/:nombre&:base&:altura&:lado1&:lado2', this.nuevoTrianguloGet)
        this._router.post('/nuevoP', this.nuevoTrianguloPost)
        this._router.get('/area/:nombre', this.getArea)
        this._router.get('/areav2/:nombre', this.getAreav2)
        this._router.get('/borrar/:nombre', this.getDelete)
        this._router.get('/areas', this.getAreas)
        this._router.post('/actualiza/:nombre', this.actualiza)
    }
}

const obj = new TrianguloRoutes()
obj.misRutas()
export const trianguloRoutes = obj.router
