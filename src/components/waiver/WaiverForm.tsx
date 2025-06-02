import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import SignaturePad from './SignaturePad';

type SignerType = 'ADULT' | 'MINOR' | 'ADULT_AND_MINOR';

interface WaiverFormProps {
  reservationId: string;
  onComplete: () => void;
}

const WaiverForm: React.FC<WaiverFormProps> = ({ reservationId, onComplete }) => {
  const toast = useToast();
  const [signerType, setSignerType] = useState<SignerType>('ADULT');
  const [signature, setSignature] = useState<string | null>(null);
  const [minorSignature, setMinorSignature] = useState<string | null>(null);
  const [electronicConsentChecked, setElectronicConsentChecked] = useState(false);

  const [adultName, setAdultName] = useState('');
  const [adultDob, setAdultDob] = useState('');
  const [adultEmail, setAdultEmail] = useState('');

  const [minorName, setMinorName] = useState('');
  const [minorDob, setMinorDob] = useState('');
  const [minorEmail, setMinorEmail] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianDob, setGuardianDob] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');

  const handleAdultSignature = (dataUrl: string) => {
    setSignature(dataUrl);
  };

  const handleGuardianSignature = (dataUrl: string) => {
    setMinorSignature(dataUrl);
  };

  const handleSubmit = async () => {
    if (signerType === 'ADULT' || signerType === 'ADULT_AND_MINOR') {
      if (!adultName || !adultDob || !adultEmail || !signature || !electronicConsentChecked) {
        toast({
          title: 'Missing information',
          description: 'Please fill out all required adult fields and sign the waiver',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    }

    if (signerType === 'MINOR' || signerType === 'ADULT_AND_MINOR') {
      if (!minorName || !minorDob || !guardianName || !guardianDob || !guardianEmail || !minorSignature || !electronicConsentChecked) {
        toast({
          title: 'Missing information',
          description: 'Please fill out all required guardian and minor fields and sign the waiver',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    }

    //TODO implement to send the data to the api just a placeholder
    try {
      /* 
      await api.post('/waivers', {
        reservationId,
        signerType,
        adultInfo: signerType === 'ADULT' || signerType === 'ADULT_AND_MINOR' ? {
          name: adultName,
          dob: adultDob,
          email: adultEmail,
          signature
        } : null,
        minorInfo: signerType === 'MINOR' || signerType === 'ADULT_AND_MINOR' ? {
          name: minorName,
          dob: minorDob,
          email: minorEmail,
          guardianName,
          guardianDob,
          guardianEmail,
          guardianSignature: minorSignature
        } : null,
        electronicConsentChecked
      });
      */

      toast({
        title: 'Waiver submitted',
        description: 'Your waiver has been submitted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onComplete();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error submitting your waiver. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <Box 
        bg="yellow.100" 
        p={4} 
        borderRadius="md" 
        textAlign="center"
        mb={6}
      >
        <Text fontWeight="bold">This activity requires that all participants sign a waiver</Text>
      </Box>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        p={6}
        boxShadow="sm"
        bg="white"
      >
        <Box textAlign="center" mb={8}>
          <Box my={4}>
            {/*
            TODO add the logo of the company
            */}
            <img 
              src="/logo.png" 
              alt="Another Side of San Diego Tours" 
              style={{ maxHeight: '60px', margin: '0 auto' }} 
            />
          </Box>
          <Heading as="h1" size="lg" mb={2}>
            ASSUMPTION OF RISK, RELEASE OF LIABILITY AND 
          </Heading>
          <Heading as="h1" size="lg">
            INDEMNIFICATION AGREEMENT ("AGREEMENT")
          </Heading>
        </Box>

        <Box mb={6}>
          <Text>
            In consideration of being allowed to participate in any way in one or more Another Side Tours Inc. ("AST") programs, related events and activities (referred to herein as an "AST Activity" or "AST Activities" as the context requires), I acknowledge, appreciate, and agree that:
          </Text>
        </Box>

        <Box mb={6}>
          <Text fontWeight="bold" mb={2}>General.</Text>
          <Text>
            Risks of AST Activities include, but are not limited to, death, injury to the head, neck or spine; injury to muscles, bones, ligaments, tendons and other connective tissues; injury to internal and external organs; loss of, or damage to, sight, hearing, or teeth; long- or short-term disability; loss of income, career opportunities or the enjoyment of life; and pain, scarring or disfigurement. The causes of possible injury are many, including but not limited to: injury from body contact, incidental or inherent in the nature of the AST Activity; slipping and falling or tripping on surfaces, regardless of physical or environmental conditions; injury from alcoholic beverages, food, horseback riding, Segway riding, motor vehicles, aircraft, watercraft, bicycles, electric bicycles, fishing, off-road vehicles, domestic or wild animals; injury due to supervision or lack of supervision by AST employees or agents, including guides or drivers, or to rules or regulations and instructions (or lack thereof) regarding the use of equipment or tools or to the nature of the activity itself, particularly in activities involving contact (or potential contact) with other persons, or anyone in public, equipment or animals; or injury caused by other participants; or malicious acts of other participants, regardless of whether AST had or should have had knowledge of the likelihood of malicious acts by such participant. Because of the hazardous nature of AST adventures, participants have been injured in the past for a summary report on those injuries, please request this in writing AST. The risk of injury from many of the activities is significant, including the potential for permanent paralysis and death, and while particular skills, rules, equipment, and personal discipline may reduce this risk, the risk of serious injury cannot be eliminated.
          </Text>
        </Box>

        <Box mb={6}>
          <Text fontWeight="bold" mb={2}>Assumption of Risk.</Text>
          <Text>
            I KNOWINGLY AND FREELY ASSUME ALL RISKS RELATED TO OR ARISING OUT OF ANY AST ACTIVITY, both known and unknown, including without limitation, any injury or action caused by me that harms or injures in any way a pedestrian or non-participant, or others, EVEN IF ARISING FROM THE NEGLIGENCE, GROSS NEGLIGENCE OR RECKLESS DISREGARD OF THE RELEASEES (as defined in the next paragraph) or others and assume full responsibility for my participation.
          </Text>
        </Box>

        <Box mb={6}>
          <Text fontWeight="bold" mb={2}>Release from Liability.</Text>
          <Text>
            I, for myself and on behalf of my heirs, assigns, personal representatives, next of kin and whomever else may have an interest either at common law or by operation of statute, HEREBY RELEASE, WAIVE, RELINQUISH, DISCHARGE AND COVENANT NOT TO SUE AST, its officers, members, managers, shareholders, directors, officials, agents, and/or employees, lawyers, other participants, sponsoring agencies, sponsors, advertisers, and, if applicable, owners and lessors of premises used to conduct the AST Activity ("Releasees"), FROM LIABILITY FROM ANY AND ALL CLAIMS OR LIABILITIES FOR ANY AND ALL INJURY, DISABILITY, DEATH, OR LOSS OR DAMAGE TO MYSELF, ANY PERSON OR PROPERTY, WHETHER ARISING FROM THE NEGLIGENCE, GROSS NEGLIGENCE OR RECKLESS DISREGARD OF THE RELEASEES OR OTHERWISE, SUSTAINED AS A RESULT OF, ARISING OUT OF, OR RELATED TO, ANY AST ACTIVITY, to the fullest extent permitted by law.
          </Text>
        </Box>

        <Box mb={6}>
          <Text fontWeight="bold" mb={2}>Indemnity.</Text>
          <Text>
            I further agree to indemnify, defend, save, and hold harmless Releasees from and against any and all claims, demands, liabilities, damages, actions, causes of action, losses, injuries, costs, or expenses, including attorneys' fees, arising out of, or in any manner connected with, my participation in any AST Activity, except to the extent caused solely by the willful misconduct of AST. I acknowledge that the agreements made herein were and will continue to be a material and important consideration and inducement to AST's admittance of me to any AST Activity.
          </Text>
        </Box>

        <Box mb={6}>
          <Text fontWeight="bold" mb={2}>Representations and Warranties.</Text>
          <Text>
            I represent and warrant I am in good physical condition and able to safely participate in any AST Activity in which I participate. I willingly agree to comply with the stated and customary terms and conditions for participation. If I observe any unusual significant hazard during my presence or participation, I will remove myself from participation and bring such to the attention of the nearest AST employee immediately. I will not exceed my physical abilities during the activity. I acknowledge that AST has made no recommendations or determinations as to my fitness or ability to participate in any AST Activity. I represent and warrant that I shall periodically and as needed consult with my physician, and shall not engage in any activity that is more rigorous than that recommended by such physician. I further agree that I will not use any equipment unless and until I determine that I have thoroughly familiarized myself with the correct use and operation thereof. I further agree that I will not participate in any activity if I am ill, in poor health, or under the influence of any substance, or have any condition that might make my participation in the activity dangerous to me or if I have reason to believe I am injured, or may become injured, or may injure someone else. I represent and warrant to AST that I have full legal authority to complete the registration process and agree to this Agreement.
          </Text>
        </Box>

        <Box mb={6}>
          <Text fontWeight="bold" mb={2}>Intellectual Property Rights.</Text>
          <Text>
            I expressly grant AST the right, including, without limitation, any and all copyrights, to use my likeness, including, but not limited to, any photograph, videotape, motion picture, recording or any other record produced by or for AST during an AST Activity, in any advertising, Web site or promotional materials, or for any other legitimate purpose, without obligation to obtain my further consent.
          </Text>
        </Box>

        <Box mb={6}>
          <Text fontWeight="bold" mb={2}>Severability.</Text>
          <Text>
            I expressly agree that this Agreement is intended to be as broad and inclusive as is permitted by the internal laws of the State of California, and that if any portion thereof is held invalid, it is agreed that the balance shall, notwithstanding, continue in full legal force and effect.
          </Text>
        </Box>

        <Box mb={6}>
          <Text fontWeight="bold" mb={2}>Miscellaneous.</Text>
          <Text>
            This Agreement is entered into in San Diego, California and shall be construed under the internal laws of the State of California in San Diego, California. Any dispute between AST and me shall be determined by binding arbitration by a single arbitrator in San Diego, California under the Commercial Arbitration Rules of the American Arbitration Association. This Agreement shall supersede any concurrent or prior agreements between the parties and may be modified only in a writing that specifically references this Agreement and is signed by the owner or owners of AST. I have had ample opportunity to retain independent legal counsel. Therefore, this Agreement shall not be strictly construed against the drafting party or parties. This Agreement may be signed via facsimile.
          </Text>
        </Box>

        <Box mb={6}>
          <Text fontWeight="bold">
            I HAVE READ THIS ASSUMPTION OF RISK, RELEASE OF LIABILITY AND INDEMNIFICATION AGREEMENT, FULLY UNDERSTAND ITS TERMS, UNDERSTAND THAT I HAVE GIVEN UP SUBSTANTIAL RIGHTS BY SIGNING IT, INCLUDING THE RIGHT TO SUE, AND SIGN IT FREELY AND VOLUNTARILY AND INTEND TO COMPLETELY AND UNCONDITIONALLY RELEASE AST FROM ALL LIABILITY IN CONNECTION WITH MY PARTICIPATION IN, OR ATTENDANCE OF, ANY AST ACTIVITY.
          </Text>
        </Box>

        <Box mb={6}>
          <Text fontWeight="bold" mb={4}>
            FOR PARTICIPANTS OF MINORITY AGE:
          </Text>
          <Text fontWeight="bold">
            (UNDER AGE 18 AT THE TIME OF REGISTRATION)
          </Text>
        </Box>

        <Box mb={6}>
          <Text>
            This is to certify that I, as parent/guardian with legal responsibility for this participant, do consent and agree to his/her assumption of risk, release from liability and indemnification as provided above of all the Releasees, and, for myself, my heirs, assigns, and next of kin, I release and agree to indemnify and hold harmless the RELEASEES from any and all liabilities incident to my minor child's involvement or participation in any AST Activities as provided above, EVEN IF ARISING FROM THE NEGLIGENCE, GROSS NEGLIGENCE OR RECKLESS DISREGARD OF THE RELEASEES, to the fullest extent permitted by law.
          </Text>
        </Box>

        <Box mb={6}>
          <Text fontWeight="bold" mb={4}>WHO ARE YOU SIGNING FOR?</Text>
          <RadioGroup onChange={(value) => setSignerType(value as SignerType)} value={signerType}>
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
              <Button 
                colorScheme={signerType === 'ADULT' ? 'blue' : 'gray'} 
                width="full" 
                onClick={() => setSignerType('ADULT')}
              >
                ADULT
              </Button>
              <Button 
                colorScheme={signerType === 'MINOR' ? 'blue' : 'gray'} 
                width="full" 
                onClick={() => setSignerType('MINOR')}
              >
                MINOR(S)
              </Button>
              <Button 
                colorScheme={signerType === 'ADULT_AND_MINOR' ? 'blue' : 'gray'} 
                width="full" 
                onClick={() => setSignerType('ADULT_AND_MINOR')}
              >
                ADULT AND MINOR(S)
              </Button>
            </Stack>
          </RadioGroup>
        </Box>

        <Box bg="yellow.100" p={4} borderRadius="md" mb={6}>
          <Text>Parents / Guardians are required to sign for minors.</Text>
        </Box>

        {(signerType === 'ADULT' || signerType === 'ADULT_AND_MINOR') && (
          <Box mb={8}>
            <Heading as="h3" size="md" mb={4}>
              {signerType === 'ADULT' ? 'GUEST INFORMATION' : 'ADULT INFORMATION'}
            </Heading>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Full Legal Name</FormLabel>
                <Input 
                  placeholder="Required" 
                  value={adultName}
                  onChange={(e) => setAdultName(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Date of Birth</FormLabel>
                <Input 
                  placeholder="MM/DD/YYYY" 
                  type="date"
                  value={adultDob}
                  onChange={(e) => setAdultDob(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input 
                  placeholder="Required" 
                  type="email"
                  value={adultEmail}
                  onChange={(e) => setAdultEmail(e.target.value)}
                />
              </FormControl>
              <Box mt={6}>
                <Text fontWeight="bold" mb={3}>Adult Signature</Text>
                <SignaturePad
                  onSave={handleAdultSignature}
                  buttonText="Add Adult Signature"
                />
                {signature && (
                  <Box mt={2} p={2} borderWidth="1px" borderRadius="md">
                    <img src={signature} alt="Signature" style={{ maxHeight: '60px' }} />
                  </Box>
                )}
              </Box>
            </Stack>
          </Box>
        )}

        {(signerType === 'MINOR' || signerType === 'ADULT_AND_MINOR') && (
          <Box mb={8}>
            <Heading as="h3" size="md" mb={4}>MINOR INFORMATION</Heading>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Full Legal Name</FormLabel>
                <Input 
                  placeholder="Required" 
                  value={minorName}
                  onChange={(e) => setMinorName(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Date of Birth</FormLabel>
                <Input 
                  placeholder="MM/DD/YYYY" 
                  type="date"
                  value={minorDob}
                  onChange={(e) => setMinorDob(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input 
                  placeholder="Optional" 
                  type="email"
                  value={minorEmail}
                  onChange={(e) => setMinorEmail(e.target.value)}
                />
              </FormControl>
            </Stack>

            {/*<Heading as="h3" size="md" my={4}>PARENT / GUARDIAN INFORMATION</Heading>*/}
            <Stack spacing={4}>
              {/*<FormControl isRequired>*/}
              {/*  <FormLabel>Full Legal Name</FormLabel>*/}
              {/*  <Input*/}
              {/*    placeholder="Required"*/}
              {/*    value={guardianName}*/}
              {/*    onChange={(e) => setGuardianName(e.target.value)}*/}
              {/*  />*/}
              {/*</FormControl>*/}
              {/*<FormControl isRequired>*/}
              {/*  <FormLabel>Date of Birth</FormLabel>*/}
              {/*  <Input*/}
              {/*    placeholder="MM/DD/YYYY"*/}
              {/*    type="date"*/}
              {/*    value={guardianDob}*/}
              {/*    onChange={(e) => setGuardianDob(e.target.value)}*/}
              {/*  />*/}
              {/*</FormControl>*/}
              {/*<FormControl isRequired>*/}
              {/*  <FormLabel>Email</FormLabel>*/}
              {/*  <Input*/}
              {/*    placeholder="Required"*/}
              {/*    type="email"*/}
              {/*    value={guardianEmail}*/}
              {/*    onChange={(e) => setGuardianEmail(e.target.value)}*/}
              {/*  />*/}
              {/*</FormControl>*/}
              <Box mt={6}>
                <Text fontWeight="bold" mb={3}>Parent / Guardian Signature</Text>
                <SignaturePad
                  onSave={handleGuardianSignature}
                  buttonText="Add Signature"
                />
                {minorSignature && (
                  <Box mt={2} p={2} borderWidth="1px" borderRadius="md">
                    <img src={minorSignature} alt="Guardian Signature" style={{ maxHeight: '60px' }} />
                  </Box>
                )}
              </Box>
            </Stack>
          </Box>
        )}

        <Box mb={6}>
          <Heading as="h3" size="md" mb={4}>ELECTRONIC SIGNATURE CONSENT</Heading>
          <Checkbox 
            isChecked={electronicConsentChecked}
            onChange={(e) => setElectronicConsentChecked(e.target.checked)}
          >
            <Text fontSize="sm">
              By checking here, you are consenting to the use of your electronic signature in lieu of an original signature on paper. You have the right to request that you sign a paper copy instead. By checking here, you are waiving that right. After consent, you may, upon written request to us, obtain a paper copy of an electronic record. No fee will be charged for such copy and no special hardware or software is required to view it. Your agreement to use an electronic signature with us for any documents will continue until such time as you notify us in writing that you no longer wish to use an electronic signature. There is no penalty for withdrawing your consent. You should always make sure that we have a current email address in order to contact you regarding any changes, if necessary.
            </Text>
          </Checkbox>
        </Box>

        <Flex justifyContent="center" mt={8}>
          <Button 
            colorScheme="green" 
            size="lg" 
            leftIcon={<span>✓</span>}
            onClick={handleSubmit}
            isDisabled={!electronicConsentChecked}
          >
            FINISH AND AGREE
          </Button>
        </Flex>
      </Box>
    </Container>
  );
};

export default WaiverForm; 