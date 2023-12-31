import React, { useState } from 'react'
import * as UserService from '../services/UserService'
import Master from '../components/Master'
import { strings as commonStrings } from '../lang/common'
import { strings as cpStrings } from '../lang/change-password'
import { strings as rpStrings } from '../lang/reset-password'
import { strings as mStrings } from '../lang/master'
import { strings } from '../lang/activate'
import NoMatch from './NoMatch'
import {
    Input,
    InputLabel,
    FormControl,
    FormHelperText,
    Button,
    Paper,
    Link
} from '@mui/material'
import * as Helper from '../common/Helper'
import { useNavigate } from 'react-router-dom'

import '../assets/css/activate.css'

const Activate = () => {
    const navigate = useNavigate()
    const [userId, setUserId] = useState()
    const [email, setEmail] = useState()
    const [token, setToken] = useState()
    const [visible, setVisible] = useState(false)
    const [resend, setResend] = useState(false)
    const [noMatch, setNoMatch] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordError, setPasswordError] = useState(false)
    const [confirmPasswordError, setConfirmPasswordError] = useState(false)
    const [passwordLengthError, setPasswordLengthError] = useState(false)
    const [reset, setReset] = useState(false)

    const handleNewPasswordChange = (e) => {
        setPassword(e.target.value)
    }

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value)
    }

    const handleOnConfirmPasswordKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e)
        }
    }

    const handleSubmit = async (e) => {
        try {
            e.preventDefault()

            if (password.length < 6) {
                setPasswordLengthError(true)
                setConfirmPasswordError(false)
                setPasswordError(false)
            } else {
                setPasswordLengthError(false)
                setPasswordError(false)
            }

            if (password !== confirmPassword) {
                setConfirmPasswordError(true)
                setPasswordError(false)
            } else {
                setConfirmPasswordError(false)
                setPasswordError(false)
            }

            const data = { userId, token, password }

            const status = await UserService.activate(data)
            if (status === 200) {
                const signInResult = await UserService.signin({ email, password })

                if (signInResult.status === 200) {
                    const status = await UserService.deleteTokens(userId)

                    if (status === 200) {
                        navigate('/')
                    } else {
                        Helper.error()
                    }
                } else {
                    Helper.error()
                }
            } else {
                Helper.error()
            }
        } catch (err) {
            Helper.error(err)
        }
    }

    const handleResend = async () => {
        try {
            const status = await UserService.resend(email, false)

            if (status === 200) {
                Helper.info(commonStrings.ACTIVATION_EMAIL_SENT)
            } else {
                Helper.error()
            }
        } catch (err) {
            Helper.error(err)
        }
    }

    const onLoad = async (user) => {

        if (user) {
            setNoMatch(true)
        } else {
            const params = new URLSearchParams(window.location.search)
            if (params.has('u') && params.has('e') && params.has('t')) {
                const userId = params.get('u')
                const email = params.get('e')
                const token = params.get('t')
                if (userId && email && token) {
                    try {
                        const status = await UserService.checkToken(userId, email, token)

                        if (status === 200) {
                            setUserId(userId)
                            setEmail(email)
                            setToken(token)
                            setVisible(true)

                            if (params.has('r')) {
                                const reset = params.get('r') === 'true'
                                setReset(reset)
                            }
                        } else if (status === 204) {
                            setEmail(email)
                            setResend(true)
                        } else {
                            setNoMatch(true)
                        }

                    } catch {
                        setNoMatch(true)
                    }
                } else {
                    setNoMatch(true)
                }
            } else {
                setNoMatch(true)
            }
        }
    }

    return (
        <Master onLoad={onLoad} strict={false}>
            {resend &&
                <div className="resend">
                    <Paper className="resend-form" elevation={10}>
                        <h1>{strings.ACTIVATE_HEADING}</h1>
                        <div className='resend-form-content'>
                            <label>{strings.TOKEN_EXPIRED}</label>
                            <Button
                                type="button"
                                variant="contained"
                                size="small"
                                className="btn-primary btn-resend"
                                onClick={handleResend}
                            >{mStrings.RESEND}</Button>
                            <p className='go-to-home'><Link href='/'>{commonStrings.GO_TO_HOME}</Link></p>
                        </div>
                    </Paper>
                </div>
            }
            {visible &&
                <div className="activate">
                    <Paper className="activate-form" elevation={10}>
                        <h1>{reset ? rpStrings.RESET_PASSWORD_HEADING : strings.ACTIVATE_HEADING}</h1>
                        <form onSubmit={handleSubmit}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel className='required' error={passwordError}>
                                    {cpStrings.NEW_PASSWORD}
                                </InputLabel>
                                <Input
                                    id="password-new"
                                    onChange={handleNewPasswordChange}
                                    type='password'
                                    value={password}
                                    error={passwordError}
                                    required
                                />
                                <FormHelperText
                                    error={passwordError}
                                >
                                    {(passwordError && cpStrings.NEW_PASSWORD_ERROR) || ''}
                                </FormHelperText>
                            </FormControl>
                            <FormControl fullWidth margin="dense" error={confirmPasswordError}>
                                <InputLabel error={confirmPasswordError} className='required'>
                                    {commonStrings.CONFIRM_PASSWORD}
                                </InputLabel>
                                <Input
                                    id="password-confirm"
                                    onChange={handleConfirmPasswordChange}
                                    onKeyDown={handleOnConfirmPasswordKeyDown}
                                    error={confirmPasswordError || passwordLengthError}
                                    type='password'
                                    value={confirmPassword}
                                    required
                                />
                                <FormHelperText
                                    error={confirmPasswordError || passwordLengthError}
                                >
                                    {confirmPasswordError
                                        ? commonStrings.PASSWORDS_DONT_MATCH
                                        : (passwordLengthError ? commonStrings.PASSWORD_ERROR : '')}
                                </FormHelperText>
                            </FormControl>
                            <div className='buttons'>
                                <Button
                                    type="submit"
                                    className='btn-primary btn-margin btn-margin-bottom'
                                    size="small"
                                    variant='contained'
                                >
                                    {reset ? commonStrings.UPDATE : strings.ACTIVATE}
                                </Button>
                                <Button
                                    className='btn-secondary btn-margin-bottom'
                                    size="small"
                                    variant='contained'
                                    href="/"
                                >
                                    {commonStrings.CANCEL}
                                </Button>
                            </div>
                        </form>
                    </Paper>
                </div>
            }
            {noMatch && <NoMatch hideHeader />}
        </Master>
    )
}

export default Activate