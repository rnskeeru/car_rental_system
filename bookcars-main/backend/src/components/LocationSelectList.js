import React, { useState, useEffect } from 'react'
import Env from '../config/env.config'
import * as LocationService from '../services/LocationService'
import * as Helper from '../common/Helper'
import MultipleSelect from './MultipleSelect'

const LocationSelectList = (props) => {
    const [init, setInit] = useState(false)
    const [loading, setLoading] = useState(false)
    const [rows, setRows] = useState([])
    const [fetch, setFetch] = useState(true)
    const [page, setPage] = useState(1)
    const [keyword, setKeyword] = useState('')
    const [selectedOptions, setSelectedOptions] = useState([])

    useEffect(() => {
        const _value = props.multiple ? props.value : [props.value]
        if (props.value && !Helper.arrayEqual(selectedOptions, _value)) {
            setSelectedOptions(_value)
        }
    }, [props.value, props.multiple, selectedOptions])

    const _fetch = async (page, keyword, onFetch) => {
        try {
            if (fetch) {
                setLoading(true)

                const data = await LocationService.getLocations(keyword, page, Env.PAGE_SIZE)
                const _data = Array.isArray(data) && data.length > 0 ? data[0] : { resultData: [] }
                const totalRecords = _data && _data.pageInfo && Array.isArray(_data.pageInfo) && _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0
                const _rows = page === 1 ? _data.resultData : [...rows, ..._data.resultData]

                setRows(_rows)
                setFetch(_data.resultData.length > 0)

                if (onFetch) {
                    onFetch({ rows: _data.resultData, rowCount: totalRecords })
                }
            }
        } catch (err) {
            Helper.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (values) => {
        if (props.onChange) {
            props.onChange(values)
        }
    }

    return (
        <MultipleSelect
            loading={loading}
            label={props.label || ''}
            callbackFromMultipleSelect={handleChange}
            options={rows}
            selectedOptions={selectedOptions}
            required={props.required || false}
            multiple={props.multiple}
            type={Env.RECORD_TYPE.LOCATION}
            variant={props.variant || 'standard'}
            ListboxProps={{
                onScroll: (event) => {
                    const listboxNode = event.currentTarget
                    if (fetch && !loading && (listboxNode.scrollTop + listboxNode.clientHeight >= (listboxNode.scrollHeight - Env.PAGE_OFFSET))) {
                        const p = page + 1
                        setPage(p)
                        _fetch(p, keyword)
                    }
                }
            }}
            onFocus={
                () => {
                    if (!init) {
                        const p = 1
                        setRows([])
                        setPage(p)
                        _fetch(p, keyword, () => {
                            setInit(true)
                        })
                    }
                }
            }
            onInputChange={
                (event) => {
                    const value = (event && event.target ? event.target.value : null) || ''

                    //if (event.target.type === 'text' && value !== keyword) {
                    if (value !== keyword) {
                        setRows([])
                        setPage(1)
                        setKeyword(value)
                        _fetch(1, value)
                    }
                }
            }
            onClear={
                () => {
                    setRows([])
                    setPage(1)
                    setKeyword('')
                    setFetch(true)
                    _fetch(1, '')
                }
            }
        />
    )
}

export default LocationSelectList